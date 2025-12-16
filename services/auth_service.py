import hashlib
import os
import random
import smtplib
import string
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from string import Template
from typing import Any, Dict, List, Optional

from core.database import SCHEMA, execute_query
from passX import hash_password, verify_password

# -------------------------------------------------------------------------
# Utilidades (anteriormente en registerstuff.py)
# -------------------------------------------------------------------------


def username_gen(name: str = "user", base: str = "p", length: int = 8) -> str:
    """Generate a pseudo-unique username token."""
    formatted_name = name.lower().split(" ")[0]
    if formatted_name == "fabian":
        formatted_name = "favian"

    random_str = "".join(random.choices(string.ascii_lowercase + string.digits, k=16))
    hash_str = hashlib.sha256(random_str.encode()).hexdigest()
    return f"{base}-{formatted_name}-{hash_str[:length]}"


def send_html_email(to, subject, template_path, context):
    """Send an HTML email using a template and context values."""
    SMTP_SERVER = "smtp.gmail.com"
    SMTP_PORT = 587
    SMTP_USERNAME = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("Correos deshabilitados: faltan credenciales SMTP.")
        return False

    try:
        with open(template_path, "r", encoding="utf-8") as f:
            html_template = Template(f.read())

        html_content = html_template.safe_substitute(context)

        msg = MIMEMultipart("alternative")
        msg["From"] = SMTP_USERNAME
        msg["To"] = to
        msg["Subject"] = subject

        part = MIMEText(html_content, "html")
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
# Lógica de Queries
# -------------------------------------------------------------------------


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    if not email:
        return None

    sql = f"""
    SELECT id_usuario, username, correo, contraseña_hash, estado_cuenta
    FROM "{SCHEMA}".usuario
    WHERE correo = %s;
    """
    return execute_query(sql, (email,), fetch_one=True)


def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    if not username:
        return None

    sql = f"""
    SELECT id_usuario, username, correo, contraseña_hash, estado_cuenta
    FROM "{SCHEMA}".usuario
    WHERE username = %s;
    """
    return execute_query(sql, (username,), fetch_one=True)


def get_user_roles(id_usuario: str) -> List[str]:
    if not id_usuario:
        return []

    sql = f"""
    SELECT r.nombre
    FROM "{SCHEMA}".usuario_rol ur
    JOIN "{SCHEMA}".rol r ON ur.id_rol = r.id_rol
    WHERE ur.id_usuario = %s;
    """
    roles_data = execute_query(sql, (id_usuario,))
    return [row["nombre"] for row in roles_data] if roles_data else []


def user_is_admin(id_usuario: str) -> bool:
    roles = get_user_roles(id_usuario)
    roles_norm = {(r or "").strip().lower() for r in roles}
    return (
        "admin" in roles_norm
        or "administrator" in roles_norm
        or "administrador" in roles_norm
    )


def login_with_email(email: str, password: str) -> bool:
    """Auth por correo usando el hash almacenado."""
    u = get_user_by_email(email)
    if not u:
        return False

    stored_hash = u.get("contraseña_hash")
    if not stored_hash:
        return False

    try:
        return verify_password(password, stored_hash)
    except Exception as e:
        print(f"login_with_email error: {e}")
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
    is_admin: bool = False,
) -> bool:
    """
    Unified registration function that handles both admin and provider registration.
    """
    try:
        from core.database import get_db_connection

        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # 1) Create usuario
                insert_user_sql = f"""
                INSERT INTO "{SCHEMA}".usuario (
                    username, contraseña_hash, correo, github, instagram, linkedin, website
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s
                ) RETURNING id_usuario;
                """
                cur.execute(
                    insert_user_sql,
                    (username, hash_password(password), email, "", None, None, None),
                )

                row = cur.fetchone()
                id_usuario = row["id_usuario"] if row else None

                if not id_usuario:
                    print("register: no id_usuario after insert")
                    conn.rollback()
                    return False

                # 2) Create profile based on type
                role_name = "Proveedor"
                if is_admin:
                    # Admin profile
                    insert_admin_sql = f"""
                    INSERT INTO "{SCHEMA}".perfil_admin (id_admin, nombre)
                    VALUES (%s, %s);
                    """
                    cur.execute(insert_admin_sql, (id_usuario, name))
                    role_name = "Admin"
                else:
                    # Provider profile
                    nit = (
                        identificacion_nit
                        or f"TEMP-{str(id_usuario).replace('-', '')[-6:]}"
                    )

                    insert_prov_sql = f"""
                    INSERT INTO "{SCHEMA}".perfil_proveedor (
                        id_proveedor, tipo_proveedor, identificacion_nit, nombre_legal,
                        nombres_apellidos, telefono, direccion, ciudad, portafolio_resumen
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                    """
                    cur.execute(
                        insert_prov_sql,
                        (
                            id_usuario,
                            tipo_proveedor,
                            nit,
                            nombre_legal,
                            nombres_apellidos or name,
                            telefono or phone,
                            direccion,
                            city,
                            portafolio_resumen,
                        ),
                    )

                # 3) Assign role
                select_role_sql = (
                    f'SELECT id_rol FROM "{SCHEMA}".rol WHERE nombre = %s;'
                )
                cur.execute(select_role_sql, (role_name,))
                role_data = cur.fetchone()

                if not role_data:
                    # Try fallback to 'Administrator' or similar if needed?
                    # But for now assume 'Admin' or 'Proveedor' exists as per connector.py logic.
                    print(f"register: no {role_name} role found")
                    conn.rollback()
                    return False

                id_rol = role_data["id_rol"]

                insert_role_sql = f"""
                INSERT INTO "{SCHEMA}".usuario_rol (id_usuario, id_rol)
                VALUES (%s, %s);
                """
                cur.execute(insert_role_sql, (id_usuario, id_rol))

                conn.commit()
                return True

    except Exception as e:
        print(f"register error: {e}")
        return False
