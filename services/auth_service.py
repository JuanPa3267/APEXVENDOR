from core.database import supabase
from passX import verify_password, hash_password
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from string import Template
import random
import string
import hashlib

# -------------------------------------------------------------------------
# Utilidades (anteriormente en registerstuff.py)
# -------------------------------------------------------------------------

def username_gen(name: str = "user", base: str = "p", length: int = 8) -> str:
    """Generate a pseudo-unique username token."""
    formatted_name = name.lower().split(" ")[0]
    if formatted_name == "fabian":
        formatted_name = "favian"
    
    random_str = ''.join(random.choices(
        string.ascii_lowercase + string.digits, k=16))
    hash_str = hashlib.sha256(random_str.encode()).hexdigest()
    return f"{base}-{formatted_name}-{hash_str[:length]}"

def send_html_email(to, subject, template_path, context):
    """Send an HTML email using a template and context values."""
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    SMTP_USERNAME = os.getenv('SMTP_USERNAME')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
    
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("Correos deshabilitados: faltan credenciales SMTP.")
        return False

    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            html_template = Template(f.read())
        
        html_content = html_template.safe_substitute(context)

        msg = MIMEMultipart('alternative')
        msg['From'] = SMTP_USERNAME
        msg['To'] = to
        msg['Subject'] = subject

        part = MIMEText(html_content, 'html')
        msg.attach(part)

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending HTML email: {e}")
        return False

# -------------------------------------------------------------------------
# Lógica de Queries (anteriormente en connector.py)
# -------------------------------------------------------------------------

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

def get_user_roles(id_usuario: str) -> list[str]:
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
        r = (
            supabase.table("rol")
            .select("nombre")
            .eq("id_rol", rid)
            .single()
            .execute()
        )
        if r and r.data and r.data.get("nombre"):
            roles.append(r.data["nombre"])
    return roles

def user_is_admin(id_usuario: str) -> bool:
    roles = get_user_roles(id_usuario)
    roles_norm = {(r or "").strip().lower() for r in roles}
    return "admin" in roles_norm or "administrator" in roles_norm or "administrador" in roles_norm

def login_with_email(email: str, password: str) -> bool:
    """Auth por correo usando el hash almacenado."""
    u = get_user_by_email(email)
    if not u:
        return False
    hash_bytes = (u.get("contraseña_hash") or "").encode("utf-8")
    try:
        return bool(hash_bytes) and verify_password(password, hash_bytes.decode())
    except Exception:
        # Fallback si el hash no es compatible con passX directo (sucio) o error
        return False

def register_user(
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
    is_admin: bool = False
) -> bool:
    """
    Unified registration function that handles both admin and provider registration.
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
        role_name = "Proveedor"
        if is_admin:
            # Admin profile
            supabase.table("perfil_admin").insert({
                "id_admin": id_usuario,
                "nombre": name,
            }).execute()
            role_name = "Admin"
        else:
            # Provider profile
            nit = identificacion_nit or f"TEMP-{str(id_usuario).replace('-', '')[-6:]}"
            supabase.table("perfil_proveedor").insert({
                "id_proveedor": id_usuario,
                "tipo_proveedor": tipo_proveedor,
                "identificacion_nit": nit,
                "nombre_legal": nombre_legal,
                "nombres_apellidos": nombres_apellidos or name,
                "telefono": telefono or phone,
                "direccion": direccion,
                "ciudad": city,
                "portafolio_resumen": portafolio_resumen,
            }).execute()

        # 4) Assign role
        role_data = (
            supabase.table("rol")
            .select("id_rol")
            .eq("nombre", role_name)
            .single()
            .execute()
        )
        # Si no existe el rol exacto, intenta fallback o falla
        if not role_data.data:
            print(f"register: no {role_name} role found")
            return False

        id_rol = role_data.data["id_rol"]
        supabase.table("usuario_rol").insert({
            "id_usuario": id_usuario,
            "id_rol": id_rol,
        }).execute()

        return True
    except Exception as e:
        print(f"register error: {e}")
        return False
