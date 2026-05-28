import os
import sys
from psycopg_pool import ConnectionPool
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "sovereignpass")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "sovereign_ai_db")

conn_info = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

try:
    pool = ConnectionPool(conn_info, min_size=1, max_size=10)
    print("✅ Connected to PostgreSQL database pool")
except Exception as e:
    print(f"❌ FATAL: Cannot connect to PostgreSQL database pool.\n   Message: {e}")
    sys.exit(1)

def get_db_connection():
    with pool.connection() as conn:
        yield conn
