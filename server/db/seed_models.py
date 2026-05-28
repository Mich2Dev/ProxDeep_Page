import random
import os

# Base lists to generate realistic sounding AI models
companies = ['Mistral', 'Meta', 'Qwen', 'DeepSeek', 'Google', 'Anthropic', 'Microsoft', 'Cohere', 'IBM', 'HuggingFace', 'Stability', 'Salesforce', 'Nvidia', 'EleutherAI', 'TII', '01.AI', 'Upstage', 'Nexus', 'ProxDeep']
architectures = ['7B', '8B', '13B', '14B', '32B', '34B', '70B', '72B', '8x7B', '4x8B', '110B', 'MoE-Sparse']
domains = [
    ('Código y Desarrollo', ['Coder', 'Dev', 'Programmer', 'CodeLlama', 'Syntax', 'Logic', 'Build']),
    ('Visión y Multimodal', ['VL', 'Vision', 'Sight', 'Eye', 'Multi', 'Image', 'Scan']),
    ('Salud y BioMedicina', ['Med', 'Bio', 'Clinical', 'Health', 'Doctor', 'Pharma', 'Care']),
    ('Finanzas y Auditoría', ['Fin', 'Quant', 'Trade', 'Audit', 'Ledger', 'Econ', 'Market']),
    ('Legal y Cumplimiento', ['Legal', 'Law', 'Compliance', 'Contract', 'Lex', 'Justice']),
    ('Agentes y RAG', ['Agent', 'Orchestrator', 'RAG', 'Reasoning', 'MoE', 'Instruct', 'Chat']),
    ('Generación de Contenido', ['Writer', 'Content', 'Draft', 'Copy', 'Creative', 'Text']),
    ('Análisis de Datos', ['Math', 'Data', 'Stats', 'Analytics', 'Calc', 'Engine'])
]

descriptions = [
    "SML ajustado para alta eficiencia y latencia mínima en entornos de producción restrictivos.",
    "Arquitectura Mixture of Experts optimizada para inferencia en servidores de bajo costo.",
    "Modelo especializado con un corpus corporativo masivo para garantizar respuestas libres de alucinaciones.",
    "Ideal para despliegues On-Premise. Cumple con normativas ISO y SOC2 en tratamiento de información.",
    "Versión cuantizada a 4-bits que permite correr en hardware modesto sin perder precisión técnica.",
    "Destaca en razonamiento lógico y tareas matemáticas complejas para análisis corporativo.",
    "Integración perfecta con sistemas RAG (Retrieval-Augmented Generation) para búsqueda en bases documentales.",
    "Modelo ligero que supera a GPT-3.5 en benchmarks específicos de la industria."
]

def generate_models(count=500):
    models = []
    generated_names = set()
    
    while len(models) < count:
        domain = random.choice(domains)
        category = domain[0]
        keywords = domain[1]
        
        company = random.choice(companies)
        keyword = random.choice(keywords)
        arch = random.choice(architectures)
        version = f"v{random.randint(1,4)}.{random.randint(0,5)}"
        
        # Format name
        formats = [
            f"{company}-{keyword}-{arch}",
            f"{keyword}LM-{arch}-{version}",
            f"{company}-{keyword}AI-{arch}",
            f"ProxDeep-{keyword}-{arch}-Instruct",
            f"{keyword}-{company}-{version}"
        ]
        name = random.choice(formats)
        
        if name in generated_names:
            continue
        generated_names.add(name)
        
        desc = random.choice(descriptions)
        base_model = f"{company}-{arch}"
        
        models.append(f"('{name}', '{category}', '{desc}', '{base_model}', TRUE)")
        
    return models

if __name__ == "__main__":
    init_sql_path = r"C:\Users\maiko\OneDrive\Escritorio\Hackaton\db\init.sql"
    
    with open(init_sql_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Generate 500 models
    print("Generando 500 modelos...")
    new_models = generate_models(500)
    
    # We will append an INSERT statement for the 500 models
    insert_stmt = "\n-- Auto-generado 500 modelos adicionales\nINSERT INTO smls (name, category, description, base_model_type, is_active) VALUES\n"
    insert_stmt += ",\n".join(new_models) + ";\n"
    
    with open(init_sql_path, "a", encoding="utf-8") as f:
        f.write(insert_stmt)
        
    print(f"500 modelos añadidos a {init_sql_path}")
