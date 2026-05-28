import json
from fastapi import APIRouter, Depends, HTTPException
from psycopg import Connection
from pydantic import BaseModel
from typing import List, Optional
from ..database import get_db_connection
from ..auth import get_current_user
from ..services.proposal_agent import generate_ai_proposal
from ..utils import dictfetchall, dictfetchone

router = APIRouter()

class ClientNeedCreate(BaseModel):
    problem_description: str
    expected_users_concurrent: int
    data_sensitivity: str
    use_cases_priority: List[str]
    current_ia_pain_points: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

@router.post("/client-needs", status_code=201)
def create_client_need(req: ClientNeedCreate, current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    client_id = current_user["id"]
    with conn.cursor() as cur:
        cur.execute(
            """INSERT INTO client_needs 
               (client_id, problem_description, expected_users_concurrent, data_sensitivity, use_cases_priority, current_ia_pain_points, status) 
               VALUES (%s, %s, %s, %s, %s, %s, 'submitted') 
               RETURNING *""",
            (
                client_id,
                req.problem_description,
                req.expected_users_concurrent,
                req.data_sensitivity,
                json.dumps(req.use_cases_priority),
                req.current_ia_pain_points
            )
        )
        new_need = dictfetchone(cur)
        
        # Automatic AI Proposal Generation
        cur.execute("SELECT * FROM smls WHERE is_active = TRUE")
        smls_catalog = dictfetchall(cur)
        
        ai_recommendation = generate_ai_proposal(new_need, smls_catalog)
        
        cur.execute(
            """INSERT INTO proposals 
               (client_need_id, recommended_sml_ids, recommended_nodo_type, estimated_fixed_cost_usd, estimated_amortization_months, proposal_details, status) 
               VALUES (%s, %s, %s, %s, %s, %s, 'pending') 
               RETURNING *""",
            (
                new_need["id"],
                json.dumps([str(i) for i in ai_recommendation["recommended_sml_ids"]]),
                ai_recommendation["recommended_nodo_type"],
                ai_recommendation["estimated_fixed_cost_usd"],
                ai_recommendation["estimated_amortization_months"],
                ai_recommendation["proposal_details"]
            )
        )
        proposal = dictfetchone(cur)
        
        cur.execute("UPDATE client_needs SET status = 'proposal_generated', updated_at = NOW() WHERE id = %s", (new_need["id"],))
        new_need["status"] = 'proposal_generated'
        
        conn.commit()
        return {"message": "Diagnóstico y propuesta generados exitosamente.", "clientNeed": new_need, "proposal": proposal}

@router.get("/client-needs")
def get_client_needs(current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    with conn.cursor() as cur:
        if current_user["role"] == "admin":
            cur.execute(
                """SELECT cn.*, u.email, u.company_name 
                   FROM client_needs cn 
                   JOIN users u ON cn.client_id = u.id 
                   ORDER BY cn.created_at DESC"""
            )
        else:
            cur.execute(
                "SELECT * FROM client_needs WHERE client_id = %s ORDER BY created_at DESC",
                (current_user["id"],)
            )
        return dictfetchall(cur)

@router.get("/client-needs/{id}")
def get_client_need_by_id(id: int, current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    with conn.cursor() as cur:
        if current_user["role"] == "admin":
            cur.execute(
                """SELECT cn.*, u.email, u.company_name 
                   FROM client_needs cn 
                   JOIN users u ON cn.client_id = u.id 
                   WHERE cn.id = %s""",
                (id,)
            )
        else:
            cur.execute(
                "SELECT * FROM client_needs WHERE id = %s AND client_id = %s",
                (id, current_user["id"])
            )
        need = dictfetchone(cur)
        if not need:
            raise HTTPException(status_code=404, detail="Diagnóstico no encontrado o acceso denegado.")
        return need

@router.put("/client-needs/{id}/status")
def update_client_need_status(id: int, req: StatusUpdate, current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    valid_statuses = ['draft', 'submitted', 'reviewed', 'proposal_generated']
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Estado inválido.")

    with conn.cursor() as cur:
        if current_user["role"] == "admin":
            cur.execute("SELECT * FROM client_needs WHERE id = %s", (id,))
        else:
            cur.execute("SELECT * FROM client_needs WHERE id = %s AND client_id = %s", (id, current_user["id"]))
        
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Diagnóstico no encontrado o no autorizado.")
        
        cur.execute(
            "UPDATE client_needs SET status = %s, updated_at = NOW() WHERE id = %s RETURNING *",
            (req.status, id)
        )
        updated_need = dictfetchone(cur)
        conn.commit()
        return {"message": "Estado del diagnóstico actualizado.", "clientNeed": updated_need}
