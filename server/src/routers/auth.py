from fastapi import APIRouter, Depends, HTTPException, status
from psycopg import Connection
from pydantic import BaseModel
from typing import Optional
from ..database import get_db_connection
from ..auth import get_password_hash, verify_password, create_access_token

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str
    company_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, conn: Connection = Depends(get_db_connection)):
    if req.role not in ["client", "admin"]:
        raise HTTPException(status_code=400, detail="Rol inválido. Debe ser client o admin.")

    with conn.cursor() as cur:
        # Check if user exists
        cur.execute("SELECT * FROM users WHERE email = %s", (req.email,))
        if cur.fetchone() is not None:
            raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")

        # Insert user
        password_hash = get_password_hash(req.password)
        cur.execute(
            """INSERT INTO users (email, password_hash, role, company_name) 
               VALUES (%s, %s, %s, %s) RETURNING id, email, role, company_name, created_at""",
            (req.email, password_hash, req.role, req.company_name)
        )
        new_user = cur.fetchone()
        conn.commit()

        # Build response map from fetched row (tuple)
        user_obj = {
            "id": str(new_user[0]),
            "email": new_user[1],
            "role": new_user[2],
            "company_name": new_user[3]
        }

        token = create_access_token(user_obj)

        return {
            "message": "Usuario registrado exitosamente.",
            "token": token,
            "user": user_obj
        }

@router.post("/login")
def login(req: LoginRequest, conn: Connection = Depends(get_db_connection)):
    with conn.cursor() as cur:
        cur.execute("SELECT id, email, role, company_name, password_hash FROM users WHERE email = %s", (req.email,))
        row = cur.fetchone()

        if row is None:
            raise HTTPException(status_code=400, detail="Credenciales inválidas.")

        user_obj = {
            "id": str(row[0]),
            "email": row[1],
            "role": row[2],
            "company_name": row[3]
        }
        password_hash = row[4]

        if not verify_password(req.password, password_hash):
            raise HTTPException(status_code=400, detail="Credenciales inválidas.")

        token = create_access_token(user_obj)

        return {
            "message": "Inicio de sesión exitoso.",
            "token": token,
            "user": user_obj
        }

@router.post("/logout")
def logout():
    return {"message": "Sesión cerrada exitosamente."}
