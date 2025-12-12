from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from starlette.status import HTTP_302_FOUND
from core.config import templates
from services.auth_service import get_user_by_username, user_is_admin

router = APIRouter()

def _is_admin_request(request: Request) -> bool:
    """Verifica si el usuario autenticado es administrador."""
    role = request.cookies.get("role", "")
    if role == "admin":
        return True
    username = request.cookies.get("uid")
    if not username:
        return False
    u = get_user_by_username(username)
    return user_is_admin(u["id_usuario"]) if u else False


@router.get("/admin")
async def admin_dashboard(request: Request):
    """Página principal del panel de administradores."""
    if not _is_admin_request(request):
        return RedirectResponse(url="/profile", status_code=HTTP_302_FOUND)

    return templates.TemplateResponse(
        "chat.html", # Reusing chat template as per original code
        {"request": request, "title": "Panel Administrador"},
    )
