import json
import uuid as uuid_lib

def recommend_nodo_type(sensitivity: str, users: int) -> str:
    """
    Determines the Nodo Type based on data sensitivity and concurrent users.
    Rule: Sensitivity has priority over user count for Sovereign.
    """
    sensitivity_map = {
        "critical": 4,
        "high": 3,
        "medium": 2,
        "low": 1
    }
    
    sens_level = sensitivity_map.get(sensitivity.lower(), 1)
    
    if sens_level == 4:
        return "Sovereign"
        
    if users <= 20:
        base_nodo = "Starter"
    elif users <= 500:
        base_nodo = "Enterprise"
    else:
        base_nodo = "Sovereign"
        
    if base_nodo == "Starter" and sens_level >= 3:
        return "Enterprise"
        
    return base_nodo

def calculate_costs(nodo_type: str, num_smls: int) -> tuple[float, int]:
    """
    Calculates fixed cost and amortization based on nodo type and number of SMLs.
    Returns (fixed_cost_usd, amortization_months).
    """
    base_pricing = {
        "Starter":    {"cost": 4500.0,  "months": 4},
        "Enterprise": {"cost": 9900.0,  "months": 6},
        "Sovereign":  {"cost": 25000.0, "months": 7},
        "Custom":     {"cost": 35000.0, "months": 12}
    }
    
    pricing = base_pricing.get(nodo_type, base_pricing["Enterprise"])
    base_cost = pricing["cost"]
    
    # 10% additional per SML after the first one
    additional_smls = max(0, num_smls - 1)
    extra_cost = base_cost * 0.10 * additional_smls
    
    total_cost = base_cost + extra_cost
    return round(total_cost, 2), pricing["months"]

def generate_proposal_details(nodo_type: str, users: int, sensitivity: str, smls: list, client_need: dict) -> str:
    """
    Generates a rich technical summary for the proposal.
    """
    sml_names = [sml['name'] for sml in smls]
    sml_text = " y ".join(sml_names) if sml_names else "Modelos Generales"
    
    sens_text = {
        "critical": "crítica (Air-Gapped)",
        "high":     "alta (Red Privada)",
        "medium":   "media (VPC)",
        "low":      "baja (Cloud Dedicada)"
    }.get(sensitivity.lower(), sensitivity)
    
    problem = client_need.get("problem_description", "Optimización de procesos")
    use_cases_raw = client_need.get("use_cases_priority", "[]")
    try:
        use_cases_list = json.loads(use_cases_raw) if isinstance(use_cases_raw, str) else use_cases_raw
    except Exception:
        use_cases_list = []
    
    has_api  = "tool_api"          in use_cases_list
    has_ide  = "tool_ide"          in use_cases_list
    has_orch = "tool_orchestrator" in use_cases_list
    
    gpus_needed   = max(1, users // 50)
    vram_needed   = gpus_needed * 24
    estimated_tps = users * 25
    
    if nodo_type == "Sovereign" or sensitivity == "critical":
        hardware_spec = "Rack Dedicado - 2x NVIDIA A100 (160GB VRAM) + 256GB RAM + Redundancia"
    elif nodo_type == "Enterprise":
        hardware_spec = f"{max(2, gpus_needed)}x NVIDIA L4 ({max(48, vram_needed)}GB VRAM) + 128GB RAM"
    else:
        hardware_spec = f"{gpus_needed}x NVIDIA L4 ({vram_needed}GB VRAM total)"
    
    compliance = "SOC2 Tipo II, ISO 27001"
    if sensitivity.lower() in ['high', 'critical']:
        compliance += ", HIPAA, GDPR (Cero retención de PII en capa externa)"
    
    tools_text = []
    if has_api:  tools_text.append("- ProxDeep API Key: Acceso programático tipo OpenAI para tus desarrolladores.")
    if has_ide:  tools_text.append("- ProxDeep IDE / Chatbot UI: Interfaz lista para empleados no técnicos.")
    if has_orch: tools_text.append("- Orquestador Organizacional: Panel de control para gestión de equipos y permisos.")
    if not tools_text: tools_text.append("- Infraestructura Base: Acceso estándar a los puertos de inferencia.")
    tools_list = "\\n".join(tools_text)

    para1 = (
        f"1. ANÁLISIS DE REQUERIMIENTOS Y CUMPLIMIENTO (COMPLIANCE)\\n"
        f"Para resolver la operativa central de '{problem}' con una carga concurrente proyectada de {users} usuarios, "
        f"hemos establecido un perímetro de seguridad nivel {sens_text.upper()}. Esto garantiza el cumplimiento "
        f"de estándares rigurosos ({compliance}). El tráfico estará cifrado End-to-End (AES-256 / TLS 1.3) garantizando "
        f"que la Propiedad Intelectual (IP) y los datos confidenciales nunca alimenten ni entrenen modelos externos de terceros."
    )
    
    para2 = (
        f"2. TOPOLOGÍA DE HARDWARE Y RENDIMIENTO DE INFERENCIA\\n"
        f"Se aprovisionará un entorno aislado (Nodo {nodo_type.upper()}) capaz de mantener latencias sub-150ms bajo estrés máximo:\\n"
        f"• Clúster Físico: {hardware_spec}.\\n"
        f"• Rendimiento Proyectado: Capacidad de inferencia superior a {estimated_tps:,} Tokens por segundo (T/s).\\n"
        f"• Aceleración en VRAM: Los modelos residen 100% en memoria gráfica (Zero-Swap), eliminando cuellos de botella de disco."
    )
    
    para3 = (
        f"3. ECOSISTEMA DE MODELOS ESPECIALIZADOS (SMLs)\\n"
        f"A diferencia de un modelo genérico masivo, hemos seleccionado Small Language Models (SMLs) cuantizados y "
        f"optimizados para su caso específico. Esto reduce drásticamente las alucinaciones y el costo computacional:\\n"
        f"• Modelos inyectados en el clúster: {sml_text}."
    )
    
    para4 = (
        f"4. ENTREGABLES DE SOFTWARE Y ACCESIBILIDAD\\n"
        f"Su suscripción activa las siguientes herramientas en su intranet, listas para integrarse al día 1 sin esfuerzo de desarrollo:\\n"
        f"{tools_list}\\n\\n"
        f"Al internalizar este cómputo con ProxDeep, su organización pasará de tener un OPEX impredecible (pago por token a nubes públicas) "
        f"a un modelo CAPEX/OPEX híbrido, fijo y 100% auditable."
    )
    
    return f"{para1}\\n\\n{para2}\\n\\n{para3}\\n\\n{para4}"


def generate_ai_proposal(client_need: dict, smls_catalog: list) -> dict:
    """
    Main Orchestrator Agent function. 
    Takes a client_need dict and smls_catalog list, returns the formulated proposal dict.

    KEY DESIGN: The AI architect already validated & selected the SML UUIDs and stored them
    in use_cases_priority. We extract those UUIDs and resolve them from the catalog directly,
    instead of running a keyword matcher that would return wrong models.
    """
    sensitivity    = client_need.get("data_sensitivity", "medium")
    users          = client_need.get("expected_users_concurrent", 1)
    use_cases_raw  = client_need.get("use_cases_priority", "[]")
    
    # Parse use_cases_priority
    try:
        use_cases = json.loads(use_cases_raw) if isinstance(use_cases_raw, str) else use_cases_raw
        if not isinstance(use_cases, list):
            use_cases = []
    except Exception:
        use_cases = []
    
    # Build catalog lookup by id (as string for safe comparison)
    catalog_by_id = {str(sml['id']): sml for sml in smls_catalog}
    
    # Extract valid UUID entries from use_cases_priority and resolve them.
    uuid_smls      = []
    keyword_cases  = []
    for uc in use_cases:
        uc_str = str(uc).strip()
        try:
            uuid_lib.UUID(uc_str)           # raises ValueError if not a UUID
            if uc_str in catalog_by_id:
                uuid_smls.append(catalog_by_id[uc_str])
        except ValueError:
            keyword_cases.append(uc_str)    # tool flags or keywords
    
    if uuid_smls:
        # AI architect already chose valid models — use them directly.
        recommended_smls = uuid_smls
    elif keyword_cases:
        # Fallback: keyword matcher on non-UUID entries (shouldn't happen normally)
        recommended_smls = _keyword_recommend(keyword_cases, smls_catalog)
    else:
        # Absolute fallback: pick the first active model
        recommended_smls = smls_catalog[:1]
    
    nodo_type  = recommend_nodo_type(sensitivity, users)
    num_smls   = len(recommended_smls)
    cost, months = calculate_costs(nodo_type, num_smls)
    details    = generate_proposal_details(nodo_type, users, sensitivity, recommended_smls, client_need)
    sml_ids    = [str(sml['id']) for sml in recommended_smls]
    
    return {
        "client_need_id":               client_need["id"],
        "recommended_sml_ids":          sml_ids,
        "recommended_nodo_type":        nodo_type,
        "estimated_fixed_cost_usd":     cost,
        "estimated_amortization_months": months,
        "proposal_details":             details
    }


def _keyword_recommend(keyword_cases: list, smls_catalog: list) -> list:
    """
    Internal fallback: match keywords against SML names/descriptions.
    Only used when use_cases_priority contains no valid UUIDs.
    """
    keyword_mapping = {
        "chatbot":   ["asistente", "soporte", "chatbot", "texto", "conversación"],
        "medico":    ["médico", "clínica", "triaje", "paciente", "hospital", "salud", "bio"],
        "atención":  ["asistente", "soporte", "cliente"],
        "cliente":   ["asistente", "soporte", "cliente"],
        "soporte":   ["asistente", "soporte", "cliente", "feedback"],
        "resumen":   ["resumen", "documental", "extraer"],
        "análisis":  ["análisis", "clasificador", "extractor", "feedback"],
        "legal":     ["legal", "contratos", "cláusula", "regulatoria"],
        "finanzas":  ["financiero", "facturas", "balance"],
        "documentos":["documental", "clasificador", "entidades"],
        "código":    ["código", "desarrollo", "programación", "generación"],
        "salud":     ["salud", "médico", "bio", "clínica", "hospital"],
    }
    
    recommended = []
    recommended_ids = set()
    
    for case in keyword_cases:
        case_lower = case.lower()
        matched = False
        for key, synonyms in keyword_mapping.items():
            if key in case_lower:
                for sml in smls_catalog:
                    search_string = f"{sml['name']} {sml.get('description','')} {sml['category']}".lower()
                    if any(syn in search_string for syn in synonyms) and sml['id'] not in recommended_ids:
                        recommended.append(sml)
                        recommended_ids.add(sml['id'])
                        matched = True
                        break
            if matched:
                break
    
    if not recommended and smls_catalog:
        recommended.append(smls_catalog[0])
    
    return recommended
