import base64
from typing import Any, Dict, List, Optional

from psycopg2 import Error as Psycopg2Error

# Import DB connection from core
from core.database import SCHEMA, execute_query, get_db_connection

# ⚠️ Asegúrate de que este archivo exista en tu proyecto y contenga
# las funciones hash_password y verify_password.
from passX import hash_password, verify_password

# --- 1. CONFIGURACIÓN DE CONEXIÓN (Delegada a core/database.py) ---
# DB_HOST, DB_NAME, etc. are handled in core.database
# We import SCHEMA from there.
# --------------------------------------------------------

# ------------------------
# Obtener usuarios y roles
# ------------------------


def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    sql = f"""
    SELECT id_usuario, username, correo, contraseña_hash, estado_cuenta
    FROM "{SCHEMA}".usuario
    WHERE username = %s;
    """
    return execute_query(sql, (username,), fetch_one=True)


def get_user_roles(id_usuario: str) -> List[str]:
    """Devuelve una lista de nombres de rol para el usuario."""
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


# ------------------------
# Auth
# ------------------------


def login(username: str, password: str) -> bool:
    """Autentica contra la tabla usuario usando el hash de contraseña almacenado."""
    try:
        sql = f"""
        SELECT contraseña_hash
        FROM "{SCHEMA}".usuario
        WHERE username = %s;
        """
        resp = execute_query(sql, (username,), fetch_one=True)

        if not resp:
            return False

        stored_hash = resp["contraseña_hash"]
        return verify_password(password, stored_hash)
    except Exception as e:
        print(f"login error: {e}")
        return False


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    if not email:
        return None
    sql = f"""
    SELECT id_usuario, username, correo, contraseña_hash, estado_cuenta
    FROM "{SCHEMA}".usuario
    WHERE correo = %s;
    """
    return execute_query(sql, (email,), fetch_one=True)


def login_with_email(email: str, password: str) -> bool:
    """Auth por correo usando el hash almacenado."""
    u = get_user_by_email(email)
    if not u:
        return False

    stored_hash = u.get("contraseña_hash")
    return verify_password(password, stored_hash)


# ------------------------
# Perfil (usuario + perfil_proveedor / perfil_admin)
# ------------------------


def get_profile(username: str) -> Optional[List[Any]]:
    """Obtiene datos de usuario y perfil (proveedor o admin)."""
    data_usuario = get_user_by_username(username)
    if not data_usuario:
        return None

    user_id = data_usuario["id_usuario"]

    # 1) Intentar Perfil Proveedor
    sql_prov = f"""
    SELECT nombres_apellidos, identificacion_nit, telefono, direccion, ciudad,
           portafolio_resumen, score
    FROM "{SCHEMA}".perfil_proveedor
    WHERE id_proveedor = %s;
    """
    prov = execute_query(sql_prov, (user_id,), fetch_one=True)

    # 2) Si no hay proveedor, intentar Perfil Admin
    adm = None
    if not prov:
        sql_adm = f"""
        SELECT nombres_apellidos, identificacion_nit, telefono, direccion, ciudad,
               portafolio_resumen, score
        FROM "{SCHEMA}".perfil_admin
        WHERE id_admin = %s;
        """
        adm = execute_query(sql_adm, (user_id,), fetch_one=True)

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

    # Retorna la lista de campos en el orden esperado
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
    """Sube/actualiza imagen base64 en ApexVendor.pfps."""
    try:
        with open(img_path, "rb") as f:
            img_bytes = f.read()
        img_base64 = base64.b64encode(img_bytes).decode("utf-8")

        # Verificar si existe la imagen (para decidir INSERT o UPDATE)
        check_sql = f"""
        SELECT 1
        FROM "{SCHEMA}".pfps
        WHERE username = %s;
        """
        exists = execute_query(check_sql, (username,), fetch_one=True)

        if exists:
            # UPDATE
            update_sql = f"""
            UPDATE "{SCHEMA}".pfps
            SET image_base64 = %s
            WHERE username = %s;
            """
            execute_query(update_sql, (img_base64, username))
        else:
            # INSERT
            insert_sql = f"""
            INSERT INTO "{SCHEMA}".pfps (username, image_base64)
            VALUES (%s, %s);
            """
            execute_query(insert_sql, (username, img_base64))

    except Exception as e:
        print(f"set_img error: {e}")


def get_img(username: str, output_path: str) -> str:
    """Descarga la imagen de ApexVendor.pfps y la guarda en output_path."""
    try:
        sql = f"""
        SELECT image_base64
        FROM "{SCHEMA}".pfps
        WHERE username = %s;
        """
        resp = execute_query(sql, (username,), fetch_one=True)

        if not resp or not resp.get("image_base64"):
            return "static/img/profile.png"

        img_bytes = base64.b64decode(resp["image_base64"].strip())
        with open(output_path, "wb") as f:
            f.write(img_bytes)
        return output_path
    except Exception as e:
        print(f"get_img error: {e}")
        return "static/img/profile.png"


# ------------------------
# Registro (Transaccional)
# ------------------------


def register(
    username: str,
    password: str,
    email: str,
    name: str | None = None,
    phone: str | None = None,
    city: str | None = None,
    nombre_legal: str | None = None,
    nombres_apellidos: str | None = None,
    identificacion_nit: str | None = None,
    telefono: str | None = None,
    direccion: str | None = None,
    portafolio_resumen: str | None = None,
    tipo_proveedor: str = "Persona",
    is_admin: bool = False,
) -> bool:
    """Registra un usuario y su perfil (admin o proveedor) en una transacción segura."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # 1) Create usuario + RETURNING id_usuario
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

                id_usuario = cur.fetchone()["id_usuario"]
                if not id_usuario:
                    print("register: no id_usuario after insert")
                    conn.rollback()
                    return False

                # 2) Create profile based on type
                if is_admin:
                    insert_profile_sql = f"""
                    INSERT INTO "{SCHEMA}".perfil_admin (id_admin, nombre)
                    VALUES (%s, %s);
                    """
                    cur.execute(insert_profile_sql, (id_usuario, name))
                    role_name = "Admin"
                else:
                    nit = (
                        identificacion_nit
                        or f"TEMP-{str(id_usuario).replace('-', '')[-6:]}"
                    )
                    insert_profile_sql = f"""
                    INSERT INTO "{SCHEMA}".perfil_proveedor (
                        id_proveedor, tipo_proveedor, identificacion_nit, nombre_legal,
                        nombres_apellidos, telefono, direccion, ciudad, portafolio_resumen
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                    """
                    cur.execute(
                        insert_profile_sql,
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
                    role_name = "Proveedor"

                # 3) Assign role
                select_role_sql = f"""
                SELECT id_rol FROM "{SCHEMA}".rol WHERE nombre = %s;
                """
                cur.execute(select_role_sql, (role_name,))
                role_data = cur.fetchone()

                if not role_data:
                    print(f"register: no {role_name} role found")
                    conn.rollback()
                    return False

                id_rol = role_data["id_rol"]
                insert_user_role_sql = f"""
                INSERT INTO "{SCHEMA}".usuario_rol (id_usuario, id_rol)
                VALUES (%s, %s);
                """
                cur.execute(insert_user_role_sql, (id_usuario, id_rol))

                # 4) Commit de toda la transacción
                conn.commit()
                return True

    except Psycopg2Error as e:
        print(f"register Psycopg2 error: {e}")
        return False
    except Exception as e:
        print(f"register general error: {e}")
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
    """Wrapper para el registro de proveedor."""
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


# ------------------------
# Update y Select
# ------------------------


def update_profile_field(username: str, field: str, value: str) -> bool:
    """Actualiza un campo en la tabla usuario o perfil_proveedor."""
    try:
        u = get_user_by_username(username)
        if not u:
            print("update_profile_field: no usuario encontrado")
            return False
        id_usuario = u["id_usuario"]

        if field in (
            "correo",
            "instagram",
            "linkedin",
            "website",
            "github",
            "estado_cuenta",
        ):
            table = f'"{SCHEMA}".usuario'
            where_col = "username"
            where_val = username
        else:
            table = f'"{SCHEMA}".perfil_proveedor'
            where_col = "id_proveedor"
            where_val = id_usuario

        update_sql = f"""
        UPDATE {table}
        SET {field} = %s
        WHERE {where_col} = %s;
        """

        return execute_query(update_sql, (value, where_val))

    except Exception as e:
        print(f"update_profile_field error: {e}")
        return False


def get_provs() -> List[Dict]:
    """Obtiene todos los perfiles de proveedor."""
    sql = f"""
    SELECT * FROM "{SCHEMA}".perfil_proveedor;
    """
    resp = execute_query(sql)
    return resp if resp else []
