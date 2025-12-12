import os
from supabase import create_client, Client
from supabase.client import ClientOptions
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY", "")
SUPABASE_SCHEMA: str = os.getenv("SUPABASE_SCHEMA", "ApexVendor")

supabase: Client | None = None

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: missing SUPABASE_URL or SUPABASE_KEY. Supabase disabled.")
else:
    try:
        supabase = create_client(
            SUPABASE_URL,
            SUPABASE_KEY,
            options=ClientOptions(schema=SUPABASE_SCHEMA)
        )
    except Exception as e:
        print(f"Error initializing Supabase: {e}")
