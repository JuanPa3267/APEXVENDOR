# connector.py — básico para esquema ApexVendor

import base64
import os

from dotenv import load_dotenv
from supabase import Client, create_client
from supabase.client import ClientOptions

from passX import hash_password, verify_password

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv(
    "SUPABASE_KEY", ""
)
SUPABASE_SCHEMA: str = os.getenv("SUPABASE_SCHEMA", "ApexVendor")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: missing SUPABASE_URL or SUPABASE_KEY. Supabase disabled.")
    supabase: Client | None = None
else:
    supabase: Client = create_client(
        SUPABASE_URL,
        SUPABASE_KEY,
        options=ClientOptions(schema=SUPABASE_SCHEMA),  # ← usa ApexVendor
    )

# ------------------------
# Obtener roles (ApexVendor.rol)
# ------------------------


def get_user_by_username(username: str):
    if not supabase:
        return None
    res = (
        supabase.table("usuario")
        .select("id_usuario, username, correo, contraseña_hash, estado_cuenta")
        .eq("username", username)
        .single()
        .execute()
    )
    return res.data if res and res.data else None


def get_user_roles(id_usuario: str):
    """
    Devuelve una lista de nombres de rol para el usuario.
    Tablas esperadas:
      - usuario_rol(id_usuario, id_rol)
      - rol(id_rol, nombre)
    """
    if not supabase or not id_usuario:
        return []

    # 1) relaciones usuario_rol
    ur = (
        supabase.table("usuario_rol")
        .select("id_rol")
        .eq("id_usuario", id_usuario)
        .execute()
    )
    rol_ids = [row["id_rol"] for row in (ur.data or [])]

    if not rol_ids:
        return []

    # 2) nombres de rol
    roles = []
    for rid in rol_ids:
        r = supabase.table("rol").select("nombre").eq("id_rol", rid).single().execute()
        if r and r.data and r.data.get("nombre"):
            roles.append(r.data["nombre"])
    return roles


def user_is_admin(id_usuario: str) -> bool:
    roles = get_user_roles(id_usuario)
    # normaliza por si hay mayúsculas/espacios
    roles_norm = {(r or "").strip().lower() for r in roles}
    return (
        "admin" in roles_norm
        or "administrator" in roles_norm
        or "administrador" in roles_norm
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


def get_user_by_email(email: str):
    if not supabase or not email:
        return None
    res = (
        supabase.table("usuario")
        .select("id_usuario, username, correo, contraseña_hash, estado_cuenta")
        .eq("correo", email)
        .single()
        .execute()
    )
    return res.data if res and res.data else None


def login_with_email(email: str, password: str) -> bool:
    """Auth por correo usando el hash almacenado."""
    u = get_user_by_email(email)
    if not u:
        return False
    hash_bytes = (u.get("contraseña_hash") or "").encode("utf-8")
    try:
        import bcrypt

        return bool(hash_bytes) and bcrypt.checkpw(password.encode("utf-8"), hash_bytes)
    except Exception:
        return False


# ------------------------
# Perfil (usuario + perfil_proveedor / perfil_admin)
# ------------------------


def get_profile(username: str):
    """
    Devuelve una lista con:
    [username, correo, estado_cuenta, instagram, linkedin, website, github,
     nombres_apellidos, identificacion_nit, telefono, direccion, ciudad, portafolio_resumen, score]

    Busca primero perfil_proveedor; si no existe, intenta perfil_admin.
    Si ninguno existe, retorna valores vacíos por defecto.
    """
    if not supabase or not username:
        print("NO SUPABASE O NO USERNAME")
        return None

    # 1) usuario (usar maybe_single para evitar excepción si no hay filas)
    res_u = (
        supabase.table("usuario")
        .select(
            "id_usuario, correo, estado_cuenta, instagram, linkedin, website, github, username"
        )
        .eq("username", username)
        .maybe_single()
        .execute()
    )
    data_usuario = res_u.data
    if not data_usuario:
        return None

    user_id = data_usuario["id_usuario"]

    # 2) perfil proveedor
    prov = None
    try:
        prov = (
            supabase.table("perfil_proveedor")
            .select(
                "nombres_apellidos, identificacion_nit, telefono, direccion, ciudad, portafolio_resumen, score"
            )
            .eq("id_proveedor", user_id)
            .maybe_single()
            .execute()
        ).data
    except Exception as e:
        print(f"NO PERFIL PROVEEDOR: {e}")
        prov = None

    # 3) si no hay proveedor, intentar perfil admin
    adm = None
    if not prov:
        try:
            adm = (
                supabase.table("perfil_admin")
                .select(
                    "nombres_apellidos, identificacion_nit, telefono, direccion, ciudad, portafolio_resumen, score"
                )
                .eq("id_admin", user_id)
                .maybe_single()
                .execute()
            ).data
        except Exception as e:
            print(f"NO PERFIL ADMIN: {e}")
            adm = None

    perfil = (
        prov
        or adm
        or {
            "nombres_apellidos": "",
            "identificacion_nit": "",
            "telefono": "",
            "direccion": "",
            "ciudad": "",
            "portafolio_resumen": "",
            "score": 0,
        }
    )

    return [
        data_usuario["username"],
        data_usuario["correo"],
        data_usuario["estado_cuenta"],
        data_usuario.get("instagram"),
        data_usuario.get("linkedin"),
        data_usuario.get("website"),
        data_usuario.get("github"),
        perfil["nombres_apellidos"],
        perfil["identificacion_nit"],
        perfil["telefono"],
        perfil["direccion"],
        perfil["ciudad"],
        perfil["portafolio_resumen"],
        perfil["score"],
    ]


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

        if (
            supabase.table("pfps")
            .select("image_base64")
            .eq("username", username)
            .execute()
            .data
        ):
            supabase.table("pfps").update({"image_base64": img_base64}).eq(
                "username", username
            ).execute()
        else:
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
    email: str,
    # Basic fields
    name: str | None = None,
    phone: str | None = None,
    city: str | None = None,
    # Provider-specific fields
    nombre_legal: str | None = None,
    nombres_apellidos: str | None = None,
    identificacion_nit: str | None = None,
    telefono: str | None = None,
    direccion: str | None = None,
    portafolio_resumen: str | None = None,
    tipo_proveedor: str = "Persona",
    is_admin: bool = False,
) -> bool:
    """
    Unified registration function that handles both admin and provider registration.
    - If is_admin=True → creates perfil_admin
    - If not → creates perfil_proveedor with provided fields
    """
    if not supabase:
        return False
    try:
        # 1) Create usuario
        usuario_data = {
            "username": username,
            "contraseña_hash": hash_password(password),
            "correo": email,
            "github": "",
            "instagram": None,
            "linkedin": None,
            "website": None,
        }
        supabase.table("usuario").insert(usuario_data).execute()

        # 2) Get id_usuario
        u = (
            supabase.table("usuario")
            .select("id_usuario")
            .eq("username", username)
            .execute()
        )
        if not u.data:
            print("register: no id_usuario after insert")
            return False
        id_usuario = u.data[0]["id_usuario"]

        # 3) Create profile based on type
        if is_admin:
            # Admin profile
            supabase.table("perfil_admin").insert(
                {
                    "id_admin": id_usuario,
                    "nombre": name,
                }
            ).execute()
            role_name = "Admin"
        else:
            # Provider profile - use provided fields or defaults
            nit = identificacion_nit or f"TEMP-{str(id_usuario).replace('-', '')[-6:]}"
            supabase.table("perfil_proveedor").insert(
                {
                    "id_proveedor": id_usuario,
                    "tipo_proveedor": tipo_proveedor,
                    "identificacion_nit": nit,
                    "nombre_legal": nombre_legal,
                    "nombres_apellidos": nombres_apellidos or name,
                    "telefono": telefono or phone,
                    "direccion": direccion,
                    "ciudad": city,
                    "portafolio_resumen": portafolio_resumen,
                }
            ).execute()
            role_name = "Proveedor"

        # 4) Assign role
        role_data = (
            supabase.table("rol")
            .select("id_rol")
            .eq("nombre", role_name)
            .single()
            .execute()
        )
        if not role_data.data:
            print(f"register: no {role_name} role found")
            return False

        id_rol = role_data.data["id_rol"]
        supabase.table("usuario_rol").insert(
            {
                "id_usuario": id_usuario,
                "id_rol": id_rol,
            }
        ).execute()

        return True
    except Exception as e:
        print(f"register error: {e}")
        return False


def register_p(
    username: str,
    password: str,
    nombre_legal: str,
    nombres_apellidos: str,
    correo: str,
    identificacion_nit: str,
    telefono: str,
    direccion: str,
    ciudad: str,
    portafolio_resumen: str,
    tipo_proveedor: str,
) -> bool:
    """Legacy wrapper for provider registration."""
    return register(
        username=username,
        password=password,
        email=correo,
        nombre_legal=nombre_legal,
        nombres_apellidos=nombres_apellidos,
        identificacion_nit=identificacion_nit,
        telefono=telefono,
        direccion=direccion,
        city=ciudad,
        portafolio_resumen=portafolio_resumen,
        tipo_proveedor=tipo_proveedor,
        is_admin=False,
    )


def update_profile_field(username: str, field: str, value: str) -> bool:
    if not supabase:
        return False
    try:
        # recuperar id_usuario
        u = (
            supabase.table("usuario")
            .select("id_usuario")
            .eq("username", username)
            .single()
            .execute()
        )
        if not u.data:
            print("update_profile_field: no id_usuario luego del select")
            return False
        id_usuario = u.data["id_usuario"]

        if (
            field == "correo"
            or field == "instagram"
            or field == "linkedin"
            or field == "website"
            or field == "github"
        ):
            supabase.table("usuario").update({field: value}).eq(
                "username", username
            ).execute()
        else:
            supabase.table("perfil_proveedor").update({field: value}).eq(
                "id_proveedor", id_usuario
            ).execute()
        return True
    except Exception as e:
        print(f"update_profile_field error: {e}")
        return False


def get_provs() -> list[dict]:
    resp = supabase.table("perfil_proveedor").select("*").execute()
    return resp.data if resp and resp.data else []
