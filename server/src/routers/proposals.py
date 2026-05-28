import json
from fastapi import APIRouter, Depends, HTTPException
from psycopg import Connection
from pydantic import BaseModel
from typing import List
from ..database import get_db_connection
from ..auth import get_current_user
from ..services.proposal_agent import generate_ai_proposal
from ..utils import dictfetchall, dictfetchone

router = APIRouter()

class ProposalCreate(BaseModel):
    client_need_id: int
    recommended_sml_ids: List[int]
    recommended_nodo_type: str
    estimated_fixed_cost_usd: float
    estimated_amortization_months: int
    proposal_details: str

class StatusUpdate(BaseModel):
    status: str

@router.post("/proposals", status_code=201)
def create_proposal(req: ProposalCreate, current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    # Note: Only admins should create proposals, though auth logic might have handled it via routes.
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden crear propuestas.")

    with conn.transaction():
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM client_needs WHERE id = %s", (req.client_need_id,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="El diagnóstico asociado no existe.")
            
            cur.execute(
                """INSERT INTO proposals 
                   (client_need_id, recommended_sml_ids, recommended_nodo_type, estimated_fixed_cost_usd, estimated_amortization_months, proposal_details, status) 
                   VALUES (%s, %s, %s, %s, %s, %s, 'pending') 
                   RETURNING *""",
                (
                    req.client_need_id,
                    json.dumps(req.recommended_sml_ids),
                    req.recommended_nodo_type,
                    req.estimated_fixed_cost_usd,
                    req.estimated_amortization_months,
                    req.proposal_details
                )
            )
            proposal = dictfetchone(cur)
            
            cur.execute(
                "UPDATE client_needs SET status = 'proposal_generated', updated_at = NOW() WHERE id = %s",
                (req.client_need_id,)
            )
            
            return {"message": "Propuesta generada exitosamente.", "proposal": proposal}

@router.post("/proposals/generate_auto/{client_need_id}", status_code=201)
def generate_auto_proposal(client_need_id: str, current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    with conn.transaction():
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM client_needs WHERE id = %s", (client_need_id,))
            need_row = dictfetchone(cur)
            if not need_row:
                raise HTTPException(status_code=404, detail="El diagnóstico asociado no existe.")
            
            cur.execute("SELECT * FROM smls WHERE is_active = TRUE")
            smls_catalog = dictfetchall(cur)
            
            ai_recommendation = generate_ai_proposal(need_row, smls_catalog)
            
            cur.execute(
                """INSERT INTO proposals 
                   (client_need_id, recommended_sml_ids, recommended_nodo_type, estimated_fixed_cost_usd, estimated_amortization_months, proposal_details, status) 
                   VALUES (%s, %s, %s, %s, %s, %s, 'pending') 
                   RETURNING *""",
                (
                    ai_recommendation["client_need_id"],
                    json.dumps([str(i) for i in ai_recommendation["recommended_sml_ids"]]),
                    ai_recommendation["recommended_nodo_type"],
                    ai_recommendation["estimated_fixed_cost_usd"],
                    ai_recommendation["estimated_amortization_months"],
                    ai_recommendation["proposal_details"]
                )
            )
            proposal = dictfetchone(cur)
            
            cur.execute(
                "UPDATE client_needs SET status = 'proposal_generated', updated_at = NOW() WHERE id = %s",
                (client_need_id,)
            )
            return {"message": "Propuesta generada automáticamente por IA.", "proposal": proposal}

@router.get("/admin/proposals")
def admin_get_proposals(current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    if current_user["role"] != "admin": raise HTTPException(status_code=403)
    with conn.cursor() as cur:
        cur.execute(
            """SELECT p.*, cn.problem_description, u.email, u.company_name 
               FROM proposals p
               JOIN client_needs cn ON p.client_need_id = cn.id
               JOIN users u ON cn.client_id = u.id
               ORDER BY p.created_at DESC"""
        )
        return dictfetchall(cur)

@router.get("/admin/client-needs")
def admin_get_needs(current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    if current_user["role"] != "admin": raise HTTPException(status_code=403)
    with conn.cursor() as cur:
        cur.execute(
            """SELECT cn.*, u.email, u.company_name 
               FROM client_needs cn 
               JOIN users u ON cn.client_id = u.id 
               ORDER BY cn.created_at DESC"""
        )
        return dictfetchall(cur)

@router.get("/proposals")
def get_proposals(current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    with conn.cursor() as cur:
        if current_user["role"] == "admin":
            cur.execute(
                """SELECT p.*, cn.problem_description, u.email, u.company_name 
                   FROM proposals p
                   JOIN client_needs cn ON p.client_need_id = cn.id
                   JOIN users u ON cn.client_id = u.id
                   ORDER BY p.created_at DESC"""
            )
        else:
            cur.execute(
                """SELECT p.*, cn.problem_description 
                   FROM proposals p
                   JOIN client_needs cn ON p.client_need_id = cn.id
                   WHERE cn.client_id = %s
                   ORDER BY p.created_at DESC""",
                (current_user["id"],)
            )
        return dictfetchall(cur)

@router.get("/proposals/{id}")
def get_proposal_by_id(id: str, current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    with conn.cursor() as cur:
        if current_user["role"] == "admin":
            cur.execute(
                """SELECT p.*, cn.problem_description, u.email, u.company_name 
                   FROM proposals p
                   JOIN client_needs cn ON p.client_need_id = cn.id
                   JOIN users u ON cn.client_id = u.id
                   WHERE p.id = %s""",
                (id,)
            )
        else:
            cur.execute(
                """SELECT p.*, cn.problem_description 
                   FROM proposals p
                   JOIN client_needs cn ON p.client_need_id = cn.id
                   WHERE p.id = %s AND cn.client_id = %s""",
                (id, current_user["id"])
            )
        proposal = dictfetchone(cur)
        if not proposal:
            raise HTTPException(status_code=404, detail="Propuesta no encontrada o acceso denegado.")
        return proposal

@router.put("/proposals/{id}/status")
def update_proposal_status(id: str, req: StatusUpdate, current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    valid_statuses = ['pending', 'accepted', 'rejected']
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Estado inválido.")

    with conn.cursor() as cur:
        if current_user["role"] == "admin":
            cur.execute("SELECT * FROM proposals WHERE id = %s", (id,))
        else:
            cur.execute(
                """SELECT p.* FROM proposals p
                   JOIN client_needs cn ON p.client_need_id = cn.id
                   WHERE p.id = %s AND cn.client_id = %s""",
                (id, current_user["id"])
            )
        
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Propuesta no encontrada o no autorizada.")
        
        cur.execute(
            "UPDATE proposals SET status = %s, updated_at = NOW() WHERE id = %s RETURNING *",
            (req.status, id)
        )
        updated_proposal = dictfetchone(cur)
        conn.commit()
        return {"message": f"Propuesta actualizada a {req.status}.", "proposal": updated_proposal}

@router.delete("/proposals/{id}")
def delete_proposal(id: str, current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar propuestas.")
        
    with conn.transaction():
        with conn.cursor() as cur:
            cur.execute("DELETE FROM proposals WHERE id = %s RETURNING *", (id,))
            deleted = dictfetchone(cur)
            if not deleted:
                raise HTTPException(status_code=404, detail="Propuesta no encontrada.")
            
            cur.execute(
                "UPDATE client_needs SET status = 'submitted' WHERE id = %s",
                (deleted["client_need_id"],)
            )
            return {"message": "Propuesta eliminada exitosamente."}
