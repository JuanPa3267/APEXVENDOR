from supabase import create_client, Client
from supabase.client import ClientOptions
from dotenv import load_dotenv
import os
from passX import verify_password, hash_password

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
schema: str = os.getenv("SUPABASE_SCHEMA", "public")

supabase: Client = create_client(
    url,
    key,
    options=ClientOptions(schema=schema)
)


def login(username: str, password: str) -> bool:
    resp = supabase.table("users") \
        .select("password") \
        .eq("username", username) \
        .execute()
    return verify_password(password, resp.data[0]["password"])


print(login("test", "test"))
