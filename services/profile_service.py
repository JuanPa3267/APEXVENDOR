import base64
from typing import Any, Dict, List, Optional

from core.database import SCHEMA, execute_query


def get_profile_data(username: str) -> Optional[Dict[str, Any]]:
    """
    Fetches profile data for a given username.
    Returns a dictionary with all profile fields, or None if user not found.
    """
    if not username:
        return None

    # 1) Get user data
    sql_user = f"""
    SELECT id_usuario, correo, estado_cuenta, instagram, linkedin, website, github, username
    FROM "{SCHEMA}".usuario
    WHERE username = %s;
    """
    data_usuario = execute_query(sql_user, (username,), fetch_one=True)

    if not data_usuario:
        return None

    user_id = data_usuario["id_usuario"]

    # 2) Try Provider Profile
    sql_prov = f"""
    SELECT nombres_apellidos, identificacion_nit, telefono, direccion, ciudad, 
           portafolio_resumen, score
    FROM "{SCHEMA}".perfil_proveedor
    WHERE id_proveedor = %s;
    """
    prov = execute_query(sql_prov, (user_id,), fetch_one=True)

    # 3) Try Admin Profile if not provider
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

    # Construct the dictionary safely
    # Note: 'username' field might contain a dash like 'User-Name' -> 'Name' if we follow split logic
    # But usually splitting username for display name is a specific logic.
    # We will keep the logic from previous version.

    display_name = data_usuario["username"]
    if "-" in display_name:
        parts = display_name.split("-")
        if len(parts) > 1:
            display_name = parts[1].capitalize()

    return {
        "username": data_usuario["username"],
        "name": display_name,
        "email": data_usuario["correo"],
        "status": data_usuario["estado_cuenta"],
        "instagram": data_usuario.get("instagram") or "",
        "linkedin": data_usuario.get("linkedin") or "",
        "website": data_usuario.get("website") or "",
        "github": data_usuario.get("github") or "",
        "nombres_apellidos": perfil.get("nombres_apellidos"),
        "id_nit": perfil.get("identificacion_nit"),
        "telefono": perfil.get("telefono"),
        "direccion": perfil.get("direccion"),
        "ciudad": perfil.get("ciudad"),
        "portafolio_resumen": perfil.get("portafolio_resumen"),
        "score": perfil.get("score"),
    }


def update_profile_field(username: str, field: str, value: str) -> bool:
    try:
        # Get user ID
        sql_user = f'SELECT id_usuario FROM "{SCHEMA}".usuario WHERE username = %s;'
        u = execute_query(sql_user, (username,), fetch_one=True)

        if not u:
            return False

        id_usuario = u["id_usuario"]

        if field in ["correo", "instagram", "linkedin", "website", "github"]:
            sql_update = (
                f'UPDATE "{SCHEMA}".usuario SET {field} = %s WHERE username = %s;'
            )
            result = execute_query(sql_update, (value, username))
        else:
            # Assume provider field
            sql_update = f'UPDATE "{SCHEMA}".perfil_proveedor SET {field} = %s WHERE id_proveedor = %s;'
            result = execute_query(sql_update, (value, id_usuario))

        return result is not None

    except Exception as e:
        print(f"update_profile_field error: {e}")
        return False


def set_img(username: str, img_path: str) -> None:
    """Sube/actualiza imagen base64 en ApexVendor.pfps"""
    try:
        with open(img_path, "rb") as f:
            img_bytes = f.read()
        img_base64 = base64.b64encode(img_bytes).decode("utf-8")

        # Check existing
        check_sql = f'SELECT 1 FROM "{SCHEMA}".pfps WHERE username = %s;'
        exists = execute_query(check_sql, (username,), fetch_one=True)

        if exists:
            update_sql = (
                f'UPDATE "{SCHEMA}".pfps SET image_base64 = %s WHERE username = %s;'
            )
            execute_query(update_sql, (img_base64, username))
        else:
            insert_sql = (
                f'INSERT INTO "{SCHEMA}".pfps (username, image_base64) VALUES (%s, %s);'
            )
            execute_query(insert_sql, (username, img_base64))

    except Exception as e:
        print(f"set_img error: {e}")


def get_img(username: str, output_path: str) -> str:
    """Descarga la imagen de ApexVendor.pfps → guarda en output_path logic."""
    try:
        sql = f'SELECT image_base64 FROM "{SCHEMA}".pfps WHERE username = %s;'
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


def get_all_providers() -> List[Dict]:
    # Fetch providers with their associated user info (username, email, status)
    try:
        sql = f"""
        SELECT pp.*, u.username, u.correo, u.estado_cuenta
        FROM "{SCHEMA}".perfil_proveedor pp
        JOIN "{SCHEMA}".usuario u ON pp.id_proveedor = u.id_usuario;
        """
        resp = execute_query(sql)
        if not resp:
            return []

        # Transform flat structure to nested structure for template compatibility
        # Template expects p.usuario.username etc.
        providers = []
        for row in resp:
            # Convert RealDictRow to dict to be mutable and serializable if needed
            p_data = dict(row)

            # Nest user info
            p_data["usuario"] = {
                "username": p_data.pop("username", None),
                "correo": p_data.pop("correo", None),
                "estado_cuenta": p_data.pop("estado_cuenta", None),
            }
            providers.append(p_data)

        return providers
    except Exception as e:
        print(f"get_all_providers error: {e}")
        return []


def delete_user(username: str) -> bool:
    """Deletes a user and their associated data from the system."""
    try:
        # Get user ID
        sql_u = f'SELECT id_usuario FROM "{SCHEMA}".usuario WHERE username = %s;'
        u = execute_query(sql_u, (username,), fetch_one=True)
        if not u:
            return False

        id_usuario = u["id_usuario"]

        sql_del = f'DELETE FROM "{SCHEMA}".usuario WHERE id_usuario = %s;'
        execute_query(sql_del, (id_usuario,))
        return True
    except Exception as e:
        print(f"delete_user error: {e}")
        return False
