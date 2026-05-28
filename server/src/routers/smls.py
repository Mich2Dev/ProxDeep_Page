from fastapi import APIRouter, Depends, HTTPException
from psycopg import Connection
from pydantic import BaseModel
from typing import Optional
from ..database import get_db_connection
from ..auth import get_current_user, require_admin
from ..utils import dictfetchall, dictfetchone

router = APIRouter()

class SmlCreateUpdate(BaseModel):
    name: str
    category: str
    description: str
    base_model_type: str
    is_active: Optional[bool] = True

@router.get("/")
def get_all_smls(all: Optional[str] = None, conn: Connection = Depends(get_db_connection)):
    with conn.cursor() as cur:
        if all == 'true':
            cur.execute("SELECT * FROM smls ORDER BY name ASC")
        else:
            cur.execute("SELECT * FROM smls WHERE is_active = TRUE ORDER BY name ASC")
        return dictfetchall(cur)

@router.get("/{id}")
def get_sml_by_id(id: int, conn: Connection = Depends(get_db_connection)):
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM smls WHERE id = %s", (id,))
        sml = dictfetchone(cur)
        if not sml:
            raise HTTPException(status_code=404, detail="SML no encontrado.")
        return sml

@router.post("/", status_code=201)
def create_sml(req: SmlCreateUpdate, current_user: dict = Depends(require_admin), conn: Connection = Depends(get_db_connection)):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO smls (name, category, description, base_model_type, is_active) VALUES (%s, %s, %s, %s, %s) RETURNING *",
            (req.name, req.category, req.description, req.base_model_type, req.is_active)
        )
        sml = dictfetchone(cur)
        conn.commit()
        return {"message": "SML creado exitosamente en el catálogo.", "sml": sml}

@router.put("/{id}")
def update_sml(id: int, req: SmlCreateUpdate, current_user: dict = Depends(require_admin), conn: Connection = Depends(get_db_connection)):
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE smls SET name = %s, category = %s, description = %s, base_model_type = %s, is_active = %s, updated_at = NOW() WHERE id = %s RETURNING *",
            (req.name, req.category, req.description, req.base_model_type, req.is_active, id)
        )
        sml = dictfetchone(cur)
        if not sml:
            raise HTTPException(status_code=404, detail="SML no encontrado para actualizar.")
        conn.commit()
        return {"message": "SML actualizado exitosamente.", "sml": sml}

@router.delete("/{id}")
def delete_sml(id: int, current_user: dict = Depends(require_admin), conn: Connection = Depends(get_db_connection)):
    with conn.cursor() as cur:
        cur.execute("DELETE FROM smls WHERE id = %s RETURNING *", (id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="SML no encontrado para eliminar.")
        conn.commit()
        return {"message": "SML eliminado del catálogo exitosamente."}
