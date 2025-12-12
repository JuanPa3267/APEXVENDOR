from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from starlette.status import HTTP_302_FOUND, HTTP_303_SEE_OTHER

import services.profile_service as profile_service
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


@router.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    """Página principal del panel de administradores."""
    if not _is_admin_request(request):
        return RedirectResponse(url="/profile", status_code=HTTP_302_FOUND)

    # Get all providers
    providers = profile_service.get_all_providers()

    return templates.TemplateResponse(
        "admin_providers.html",
        {"request": request, "title": "Panel Administrador", "providers": providers},
    )


@router.post("/admin/delete_user")
async def delete_user(request: Request, username: str = Form(...)):
    if not _is_admin_request(request):
        return RedirectResponse(url="/", status_code=HTTP_302_FOUND)

    profile_service.delete_user(username)
    return RedirectResponse(url="/admin", status_code=HTTP_303_SEE_OTHER)
