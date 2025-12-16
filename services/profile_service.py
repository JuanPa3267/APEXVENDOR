import base64

from core.database import supabase


def get_profile_data(username: str) -> dict | None:
    """
    Fetches profile data for a given username.
    Returns a dictionary with all profile fields, or None if user not found.
    """
    if not supabase or not username:
        return None

    # 1) usuario
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

    # Construct the dictionary safely
    return {
        "username": data_usuario["username"],
        "name": data_usuario["username"].split("-")[1].capitalize()
        if "-" in data_usuario["username"]
        else data_usuario["username"],
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
            return False
        id_usuario = u.data["id_usuario"]

        if field in ["correo", "instagram", "linkedin", "website", "github"]:
            supabase.table("usuario").update({field: value}).eq(
                "username", username
            ).execute()
        else:
            # Asumimos que es campo de proveedor
            supabase.table("perfil_proveedor").update({field: value}).eq(
                "id_proveedor", id_usuario
            ).execute()
        return True
    except Exception as e:
        print(f"update_profile_field error: {e}")
        return False


def set_img(username: str, img_path: str) -> None:
    """Sube/actualiza imagen base64 en ApexVendor.pfps"""
    if not supabase:
        return
    try:
        with open(img_path, "rb") as f:
            img_bytes = f.read()
        img_base64 = base64.b64encode(img_bytes).decode("utf-8")

        existing = (
            supabase.table("pfps")
            .select("image_base64")
            .eq("username", username)
            .execute()
            .data
        )
        if existing:
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
    """Descarga la imagen de ApexVendor.pfps → guarda en output_path logic."""
    if not supabase:
        return "static/img/profile.png"
    try:
        resp = (
            supabase.table("pfps")
            .select("image_base64")
            .eq("username", username)
            .maybe_single()
            .execute()
        )
        if not resp.data or not resp.data.get("image_base64"):
            return "static/img/profile.png"

        img_bytes = base64.b64decode(resp.data["image_base64"].strip())
        with open(output_path, "wb") as f:
            f.write(img_bytes)
        return output_path
    except Exception as e:
        print(f"get_img error: {e}")
        return "static/img/profile.png"


def get_all_providers() -> list[dict]:
    if not supabase:
        return []
    # Fetch providers with their associated user info (username, email, status)
    # Assuming foreign key relationship exists between perfil_proveedor.id_proveedor and usuario.id_usuario
    try:
        resp = (
            supabase.table("perfil_proveedor")
            .select("*, usuario(username, correo, estado_cuenta)")
            .execute()
        )
        return resp.data if resp and resp.data else []
    except Exception as e:
        print(f"get_all_providers error: {e}")
        return []


def delete_user(username: str) -> bool:
    """Deletes a user and their associated data from the system."""
    if not supabase:
        return False
    try:
        # First get the user ID
        u = (
            supabase.table("usuario")
            .select("id_usuario")
            .eq("username", username)
            .maybe_single()
            .execute()
        )
        if not u.data:
            return False

        id_usuario = u.data["id_usuario"]

        # Delete from derived tables first if no cascade (Supabase usually handles cascade if configured, but to be sure)
        # Note: If cascade delete is on, we just delete from usuario.
        # We will attempt to delete from usuario directly.

        supabase.table("usuario").delete().eq("id_usuario", id_usuario).execute()
        return True
    except Exception as e:
        print(f"delete_user error: {e}")
        return False
