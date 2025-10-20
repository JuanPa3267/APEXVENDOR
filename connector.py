# connector.py — básico para esquema ApexVendor

from supabase import create_client, Client
from supabase.client import ClientOptions
from dotenv import load_dotenv
import os
from passX import verify_password, hash_password
import base64

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY", "")
SUPABASE_SCHEMA: str = os.getenv("SUPABASE_SCHEMA", "ApexVendor")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: missing SUPABASE_URL or SUPABASE_KEY. Supabase disabled.")
    supabase: Client | None = None
else:
    supabase: Client = create_client(
        SUPABASE_URL,
        SUPABASE_KEY,
        options=ClientOptions(schema=SUPABASE_SCHEMA)  # ← usa ApexVendor
    )

# ------------------------
# Auth (ApexVendor.usuario)
# ------------------------


def login(username: str, password: str) -> bool:
    """
    Autentica con ApexVendor.usuario usando 'contraseña_hash'.
    """
    if not supabase:
        return False
    try:
        resp = (
            supabase.table("usuario")
            .select("contraseña_hash")
            .eq("username", username)
            .execute()
        )
        if not resp.data:
            return False
        stored_hash = resp.data[0]["contraseña_hash"]
        return verify_password(password, stored_hash)
    except Exception as e:
        print(f"login error: {e}")
        return False

# ------------------------
# Perfil (usuario + perfil_proveedor / perfil_admin)
# ------------------------


def get_profile(username: str) -> dict:
    """
    Devuelve un diccionario normalizado para tu UI a partir de:
      - ApexVendor.usuario (username, correo, redes)
      - ApexVendor.perfil_proveedor o ApexVendor.perfil_admin
    Siempre retorna claves esperadas por la UI, con defaults si faltan.
    """
    if not supabase:
        return {}

    resp = supabase.table("usuario") \
        .select("*") \
        .eq("username", username) \
        .single() \
        .execute()

    return {
        "username": username,
        "name": resp.data["nombre"],
        "email": resp.data["correo"],
        "phone": resp.data["telefono"],
        "role": resp.data["rol"],
        "score": 0,
        "country": resp.data["pais"],
        "city": resp.data["ciudad"],
        "instagram": resp.data["instagram"],
        "website": resp.data["website"],
        "linkedin": resp.data["linkedin"],
        "github": resp.data["github"],
    }


# ------------------------
# Imagen de perfil (ApexVendor.pfps)
# ------------------------


def set_img(username: str, img_path: str) -> None:
    """
    Sube/actualiza imagen base64 en ApexVendor.pfps (username FK a usuario.username).
    """
    if not supabase:
        return
    try:
        with open(img_path, "rb") as f:
            img_bytes = f.read()
        img_base64 = base64.b64encode(img_bytes).decode("utf-8")

        # intenta upsert; si cliente no soporta, usa update/insert
        try:
            supabase.table("pfps").upsert(
                {"username": username, "image_base64": img_base64}
            ).execute()
        except Exception:
            upd = (
                supabase.table("pfps")
                .update({"image_base64": img_base64})
                .eq("username", username)
                .execute()
            )
            if not upd.data:
                supabase.table("pfps").insert(
                    {"username": username, "image_base64": img_base64}
                ).execute()
    except Exception as e:
        print(f"set_img error: {e}")


def get_img(username: str, output_path: str) -> str:
    """
    Descarga la imagen de ApexVendor.pfps → guarda en output_path.
    """
    if not supabase:
        return "static/img/profile.png"
    try:
        try:
            resp = (
                supabase.table("pfps")
                .select("image_base64")
                .eq("username", username)
                .single()
                .execute()
            )
        except Exception:
            resp = (
                supabase.table("pfps")
                .select("image_base64")
                .eq("username", username)
                .execute()
            )
            if resp.data:
                resp.data = resp.data[0]

        if not resp.data or not resp.data.get("image_base64"):
            return "static/img/profile.png"

        img_bytes = base64.b64decode(resp.data["image_base64"].strip())
        with open(output_path, "wb") as f:
            f.write(img_bytes)
        return output_path
    except Exception as e:
        print(f"get_img error: {e}")
        return "static/img/profile.png"

# ------------------------
# Registro (ApexVendor.usuario + perfil_proveedor / perfil_admin)
# ------------------------


def register(
    username: str,
    password: str,
    name: str,
    email: str,
    phone: str,
    country: str,
    city: str,
    *,
    tipo_proveedor: str = "Persona",        # "Persona" | "Empresa"
    identificacion_nit: str | None = None,  # requerido si es proveedor
    is_admin: bool = False                  # True → crea perfil_admin
) -> bool:
    """
    Crea usuario en ApexVendor.usuario y su perfil:
    - Si is_admin=True → perfil_admin
    - Si no → perfil_proveedor (requiere identificacion_nit; si falta, usa TEMP-<id>)
    """
    if not supabase:
        return False
    try:
        # 1) usuario
        supabase.table("usuario").insert({
            "username": username,
            "contraseña_hash": hash_password(password),
            "correo": email,
            "github": "",      # NOT NULL en tu schema → cadena vacía por defecto
            "instagram": None,
            "linkedin": None,
            "website": None,
        }).execute()

        # recuperar id_usuario
        u = (
            supabase.table("usuario")
            .select("id_usuario")
            .eq("username", username)
            .execute()
        )
        if not u.data:
            print("register: no id_usuario luego del insert")
            return False
        id_usuario = u.data[0]["id_usuario"]

        # 2) perfil
        if is_admin:
            supabase.table("perfil_admin").insert({
                "id_admin": id_usuario,
                "nombre": name or username,
            }).execute()
        else:
            nit = identificacion_nit or f"TEMP-{str(id_usuario).replace('-', '')[-6:]}"
            supabase.table("perfil_proveedor").insert({
                "id_proveedor": id_usuario,
                "tipo_proveedor": tipo_proveedor,
                "identificacion_nit": nit,
                "nombres_apellidos": name,
                "telefono": phone or None,
                "ciudad": city or None,
                "direccion": None,
                "portafolio_resumen": None,
                "nombre_legal": None,
            }).execute()

        return True
    except Exception as e:
        print(f"register error: {e}")
        return False
