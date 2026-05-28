from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os
import json
from openai import OpenAI
from ..database import get_db_connection
from psycopg import Connection

router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

class ChatMessage(BaseModel):
    message: str
    history: list[dict] = []

SYSTEM_PROMPT = """Eres el Asistente Virtual de ProxDeep, una plataforma de Nodos Cognitivos de IA Soberana.
Tu objetivo es ayudar a los visitantes a entender el valor de ProxDeep.
Responde de forma concisa, profesional, y persuasiva.
Argumentos clave de ProxDeep:
1. IP Shielding: Los datos del cliente nunca salen de su red.
2. Costos Fijos: Tarifa plana anual, sin impuesto al éxito (sin cobros exponenciales por uso de tokens).
3. SMLs Optimizados: Usamos Small Language Models especializados (Legales, Médicos, Financieros) que vencen a modelos genéricos gigantes.
Si el usuario muestra intención de compra o quiere probarlo, guíalo a "Iniciar Diagnóstico" o "Ver Catálogo".
"""

@router.post("/chat")
async def chat_with_bot(req: ChatMessage):
    if not OPENAI_API_KEY or not client:
        return {"reply": "El sistema cognitivo está en mantenimiento. Por favor contacta a proxdeep@gmail.com."}
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": req.message}
            ],
            temperature=0.7,
            max_tokens=250
        )
        
        reply = response.choices[0].message.content
        return {"reply": reply}
        
    except Exception as e:
        print(f"Error in bot chat (OpenAI): {e}")
        raise HTTPException(status_code=500, detail="Error interno procesando la solicitud de IA.")

class WorkspaceChatMessage(BaseModel):
    message: str
    sml_name: str
    sml_description: str

@router.post("/workspace-chat")
async def workspace_chat(req: WorkspaceChatMessage):
    if not OPENAI_API_KEY or not client:
        return {"reply": "El sistema cognitivo está en mantenimiento."}
    
    prompt = f"""
    Eres un Small Language Model (SML) ejecutándose en un Nodo Soberano On-Premise.
    Tu identidad actual es: {req.sml_name}.
    Tu propósito / entrenamiento especial es: {req.sml_description}.
    
    Reglas:
    1. Responde a la siguiente consulta del usuario asumiendo completamente este rol especializado.
    2. Mantén las respuestas técnicas, seguras y directas.
    3. Nunca digas que eres OpenAI o GPT. Eres un SML Open Source optimizado corriendo localmente.
    
    Consulta del usuario: {req.message}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=300
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        print(f"Error in workspace chat: {e}")
        return {"reply": "Error procesando la solicitud en el nodo."}

class SuggestRequest(BaseModel):
    description: str

@router.post("/suggest-architecture")
async def suggest_architecture(req: SuggestRequest, conn: Connection = Depends(get_db_connection)):
    if not OPENAI_API_KEY or not client:
        raise HTTPException(status_code=503, detail="OpenAI API key missing")

    with conn.cursor() as cur:
        cur.execute("SELECT id, name, category, description FROM smls LIMIT 50")
        smls_rows = cur.fetchall()
        
    # Build lookup by name for post-validation
    name_to_sml = {s[1].lower(): {"id": str(s[0]), "name": s[1], "category": s[2]} for s in smls_rows}
    
    # Give AI ONLY names — never IDs. Backend will look up the UUID.
    smls_list = "\n".join([f'- "{s[1]}" ({s[2]}): {s[3]}' for s in smls_rows])
        
    prompt = f"""Eres un arquitecto de IA especializado en nodos soberanos.

NECESIDAD DEL CLIENTE: "{req.description}"

CATÁLOGO DE MODELOS DISPONIBLES:
{smls_list}

Responde ÚNICAMENTE con este JSON (sin texto adicional):
{{
    "expected_users": <número entero entre 10 y 10000>,
    "sensitivity": "<low|medium|high|critical>",
    "recommended_smls": [
        {{
            "name": "<nombre EXACTO del modelo del catálogo>",
            "reason": "<justificación técnica de 1 oración>"
        }}
    ]
}}

REGLAS:
- Recomienda 1 o 2 modelos
- El "name" debe ser EXACTAMENTE igual al nombre entre comillas del catálogo
- NO inventes nombres"""
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        data = json.loads(response.choices[0].message.content)
        
        # Validate expected_users
        try:
            data["expected_users"] = max(10, min(10000, int(data.get("expected_users", 50))))
        except (ValueError, TypeError):
            data["expected_users"] = 50
        
        # Validate sensitivity
        valid_sens = ["low", "medium", "high", "critical"]
        if data.get("sensitivity") not in valid_sens:
            data["sensitivity"] = "medium"
        
        # === KEY FIX: Backend resolves UUIDs from names — AI never touches IDs ===
        validated_smls = []
        for item in data.get("recommended_smls", []):
            ai_name = str(item.get("name", "")).strip().lower()
            # Try exact match first
            matched = name_to_sml.get(ai_name)
            # If not exact, try partial match (model name contains AI's answer)
            if not matched:
                for catalog_name, sml in name_to_sml.items():
                    if ai_name in catalog_name or catalog_name in ai_name:
                        matched = sml
                        break
            
            if matched:
                validated_smls.append({
                    "id": matched["id"],  # Real UUID from DB
                    "name": matched["name"],  # Real name from DB
                    "reason": item.get("reason", "Modelo óptimo para este caso de uso.")
                })
        
        # Fallback: if AI found nothing valid, pick first from catalog
        if not validated_smls and smls_rows:
            first = smls_rows[0]
            validated_smls.append({
                "id": str(first[0]),
                "name": first[1],
                "reason": "Modelo de propósito general recomendado por el sistema."
            })
        
        data["recommended_smls"] = validated_smls
        return data
        
    except Exception as e:
        print(f"Error in suggest architecture: {e}")
        return {"expected_users": 50, "sensitivity": "medium", "recommended_smls": []}
