// Mock data for demo/static build - NO backend required
export const MOCK_USER = {
  id: 1,
  email: 'client@acme.com',
  role: 'client',
  company_name: 'Acme Corporation',
};

export const MOCK_TOKEN = 'demo-token-no-backend-required';

export const MOCK_SMLS = [
  {
    id: 1, name: 'Extractor de Entidades Regulatorias', category: 'Análisis Documental',
    description: 'Extrae automáticamente nombres, fechas, montos y cláusulas regulatorias en archivos escaneados pesados para aplicar la conformidad regulatoria empresarial.',
    base_model_type: 'Mistral-7B-Instruct', is_active: true,
  },
  {
    id: 2, name: 'Redactor de Contratos Legales', category: 'Generación de Contenido',
    description: 'Modelo ligero especializado en la redacción y revisión automatizada de contratos de confidencialidad (NDA), acuerdos comerciales y términos de servicio bajo regulaciones locales.',
    base_model_type: 'Llama3-8B-Legal', is_active: true,
  },
  {
    id: 3, name: 'Clasificador de Historias Clínicas', category: 'Salud',
    description: 'Clasifica y estructura historias clínicas en tiempo real. Cumple con HIPAA y normativas latinoamericanas de datos de salud. Sin exposición de datos a terceros.',
    base_model_type: 'BioMistral-7B', is_active: true,
  },
  {
    id: 4, name: 'Analizador Financiero IFRS', category: 'Finanzas',
    description: 'Extracción y análisis de balances, estados de resultados y ratios financieros bajo normas IFRS/NIF. Detección de anomalías contables sin enviar datos a la nube.',
    base_model_type: 'FinanceLM-3B', is_active: true,
  },
  {
    id: 5, name: 'Soporte Técnico IT Avanzado', category: 'Atención al Cliente',
    description: 'Chatbot especializado en resolución de tickets técnicos, análisis de logs de servidores y triaje automatizado de incidencias de infraestructura.',
    base_model_type: 'Phi-3-mini-128k', is_active: true,
  },
  {
    id: 6, name: 'Generador de Informes Ejecutivos', category: 'Generación de Contenido',
    description: 'Transforma datos brutos de dashboards y bases de datos en informes ejecutivos estructurados en segundos. Integración directa con tu ERP privado.',
    base_model_type: 'Gemma-7B-IT', is_active: true,
  },
  {
    id: 7, name: 'Detector de Fraude Transaccional', category: 'Finanzas',
    description: 'Modelo entrenado en patrones de fraude para análisis en tiempo real de transacciones bancarias y comerciales. Cero latencia de red, 100% local.',
    base_model_type: 'DistilBERT-Fraud', is_active: true,
  },
  {
    id: 8, name: 'Asistente de RRHH y Compliance', category: 'Recursos Humanos',
    description: 'Automatiza la revisión de políticas internas, onboarding de empleados y análisis de cumplimiento de normativas laborales locales sin exponer datos de nómina.',
    base_model_type: 'Mistral-7B-HR', is_active: true,
  },
  {
    id: 9, name: 'Traductor Técnico Especializado', category: 'Análisis Documental',
    description: 'Traduce documentos técnicos, manuales de ingeniería y especificaciones de producto con precisión terminológica, sin exponer propiedad intelectual a traductores externos.',
    base_model_type: 'NLLB-600M-Distilled', is_active: false,
  },
];

export const MOCK_NEED = {
  id: 1,
  problem_description: 'Necesitamos analizar miles de contratos comerciales confidenciales diariamente y extraer cláusulas de renovación automáticas. No podemos usar APIs de nube pública debido a políticas estrictas de privacidad corporativa.',
  expected_users_concurrent: 50,
  data_sensitivity: 'high',
  use_cases_priority: JSON.stringify(['tool_api', 'tool_ide', 1, 2]),
  status: 'proposal_generated',
};

export const MOCK_PROPOSAL = {
  id: 1,
  client_need_id: 1,
  status: 'pending',
  recommended_nodo_type: 'Sovereign',
  estimated_fixed_cost_usd: '12500',
  estimated_amortization_months: 6,
  recommended_sml_ids: JSON.stringify([1, 2]),
  justification_text: 'Para soportar 50 usuarios concurrentes analizando contratos de alta confidencialidad, se recomienda el Nodo Sovereign con aislamiento VPC dedicado...',
  created_at: new Date().toISOString(),
};
