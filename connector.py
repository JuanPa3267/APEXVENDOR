"""
connector.py

Handles Supabase client initialization and provides user authentication,
registration, profile retrieval, and image storage/retrieval functions.
"""
from supabase import create_client, Client
from supabase.client import ClientOptions
from dotenv import load_dotenv
import os
from passX import verify_password, hash_password
import base64

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
schema = os.getenv("SUPABASE_SCHEMA", "public")
if url and key:
    supabase: Client = create_client(
        url,
        key,
        options=ClientOptions(schema=schema)
    )
else:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not set. Supabase features disabled.")
    supabase = None


def login(username: str, password: str) -> bool:
    """
    Authenticate a user by verifying their password against the stored hash.

    Args:
        username: The username of the user attempting to log in.
        password: The plaintext password provided by the user.

    Returns:
        True if authentication succeeds, False otherwise.
    """
    if not supabase:
        print("Supabase client not configured, login skipped.")
        return False
    try:
        resp = supabase.table("users")\
            .select("password")\
            .eq("username", username)\
            .execute()
    except Exception as e:
        print(f"Supabase login error: {e}")
        return False
    return verify_password(password, resp.data[0]["password"])


def register(username: str, password: str, name: str, email: str, phone: str, country: str, city: str) -> bool:
    """
    Register a new user and create their profile record in Supabase.

    Args:
        username: Generated username prefixed with 'p-' or 'c-'.
        password: Plaintext password to hash and store.
        name: Full name of the user.
        email: Email address.
        phone: Contact phone number.
        country: Country of residence.
        city: City of residence.

    Returns:
        True if registration succeeded, False if Supabase is unavailable.
    """
    if not supabase:
        print("Supabase client not configured, register skipped.")
        return False
    supabase.table("users")\
        .insert({"username": username, "password": hash_password(password)})\
        .execute()

    role = 0 if username.split("-")[0] == "p" else 1

    supabase.table("profiles") \
        .insert({"role": role, "score": 0, "email": email, "phone": phone, "name": name, "country": country, "city": city, "username": username}) \
        .execute()
    return True


def get_profile(username: str):
    """
    Retrieve a user's profile data from Supabase.

    Args:
        username: The username whose profile to fetch.

    Returns:
        A dict of profile fields (role, score, name, etc.), or empty dict if unavailable.
    """
    if not supabase:
        print("Supabase client not configured, get_profile skipped.")
        return {}
    resp = supabase.table("profiles") \
        .select("*") \
        .eq("username", username) \
        .execute()
    return resp.data[0]


def set_img(username: str, img_path: str):
    """
    Upload or update a user's profile image in Supabase.

    Args:
        username: The username to associate with the image.
        img_path: Local filesystem path to the image file.

    Returns:
        None
    """
    if not supabase:
        print("Supabase client not configured, set_img skipped.")
        return
    with open(img_path, "rb") as f:
        img_bytes = f.read()

    img_base64 = base64.b64encode(img_bytes).decode("utf-8")

    # UPSERT: replaces if username exists
    supabase.table("pfps") \
        .upsert({"username": username, "image_base64": img_base64}) \
        .execute()


def get_img(username: str, output_path: str):
    """
    Download and decode a user's profile image from Supabase to a local file.

    Args:
        username: The username whose image to fetch.
        output_path: Local path where the image will be saved.

    Returns:
        Path to the saved image, or default placeholder if not found.
    """
    if not supabase:
        print("Supabase client not configured, get_img skipped.")
        return "static/img/profile.png"
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
