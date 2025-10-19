from supabase import create_client, Client
from supabase.client import ClientOptions
from dotenv import load_dotenv
import os
from passX import verify_password, hash_password
import base64

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


def register(username: str, password: str, name: str, email: str, phone: str, country: str, city: str) -> bool:
    supabase.table("users") \
        .insert({"username": username, "password": hash_password(password)}) \
        .execute()

    role = 0 if username.split("-")[0] == "p" else 1

    supabase.table("profiles") \
        .insert({"role": role, "score": 0, "email": email, "phone": phone, "name": name, "country": country, "city": city, "username": username}) \
        .execute()
    return True


def get_profile(username: str):
    resp = supabase.table("profiles") \
        .select("*") \
        .eq("username", username) \
        .execute()
    return resp.data[0]


def set_img(username: str, img_path: str):
    with open(img_path, "rb") as f:
        img_bytes = f.read()

    img_base64 = base64.b64encode(img_bytes).decode("utf-8")

    # UPSERT: replaces if username exists
    supabase.table("pfps") \
        .upsert({"username": username, "image_base64": img_base64}) \
        .execute()


def get_img(username: str, output_path: str):
    resp = supabase.table("pfps") \
        .select("image_base64") \
        .eq("username", username) \
        .execute()  # REMOVE .single()

    if not resp.data:
        print("No profile image found")
        return "static/img/profile.png"

    img_base64 = resp.data[0]["image_base64"].strip()
    img_bytes = base64.b64decode(img_base64)

    with open(output_path, "wb") as f:
        f.write(img_bytes)
    return output_path
