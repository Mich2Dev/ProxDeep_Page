from fastapi import APIRouter, Depends, HTTPException
from psycopg import Connection
from ..database import get_db_connection
from ..auth import get_current_user
from ..utils import dictfetchall, dictfetchone

router = APIRouter()

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, email, role, company_name, created_at FROM users WHERE id = %s",
            (current_user["id"],)
        )
        user = dictfetchone(cur)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        return user

@router.get("/")
def get_all_users(current_user: dict = Depends(get_current_user), conn: Connection = Depends(get_db_connection)):
    with conn.cursor() as cur:
        cur.execute("SELECT id, email, role, company_name, created_at FROM users ORDER BY created_at DESC")
        return dictfetchall(cur)
