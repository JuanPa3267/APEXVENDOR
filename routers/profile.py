from fastapi import APIRouter, Request, Form, UploadFile, File
from fastapi.responses import RedirectResponse
from core.config import templates
import services.profile_service as profile_service
from services.auth_service import get_user_by_username, user_is_admin
from uuid import uuid4
from pathlib import Path

router = APIRouter()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.get("/profile", response_class=RedirectResponse)
async def profile(request: Request):
    """Profile page for providers."""
    username = request.cookies.get("uid")
    if not username:
        return RedirectResponse(url="/", status_code=302)

    # Check if admin, redirect to admin if so
    try:
        u = get_user_by_username(username)
        if u and user_is_admin(u["id_usuario"]):
            return RedirectResponse(url="/admin", status_code=302)
    except Exception as e:
        print(f"Error checking role for {username}: {e}")

    # Fetch profile data
    profile_data = profile_service.get_profile_data(username)
    if not profile_data:
        # Fallback if profile not found
        return RedirectResponse(url="/", status_code=302)

    # Local image handling
    pfp_path = f"static/img/{username}_pfp.png"
    pfp = profile_service.get_img(username, pfp_path)

    context = {
        "request": request,
        "title": "Perfil del proveedor",
        "pfp": pfp,
        **profile_data  # Unpack dictionary keys into context
    }

    return templates.TemplateResponse("profile.html", context)


@router.post("/update-profile-field")
async def update_profile_field(request: Request, field: str = Form(...), value: str = Form(...)):
    """Update a single profile field."""
    uid = request.cookies.get("uid", "anon")
    success = False
    if field in ("email", "phone", "instagram", "website", "linkedin", "github", 
                 "nombres_apellidos", "identificacion_nit", "telefono", "direccion", "ciudad", "portafolio_resumen"):
         success = profile_service.update_profile_field(uid, field, value)
    
    if not success:
        return RedirectResponse(url="/profile", status_code=303) # Or JSON response depending on frontend JS
        # The original code returned JSONResponse({"ok": False}, status_code=500)
    
    from fastapi.responses import JSONResponse
    return JSONResponse({"ok": True})


@router.post("/upload-pfp")
async def upload_pfp(request: Request, file: UploadFile = File(...)):
    """Handle profile picture upload."""
    uid = request.cookies.get("uid", "anon")
    ext = Path(file.filename).suffix
    temp_path = UPLOAD_DIR / f"pfp_{uid}_{uuid4().hex}{ext}"
    contents = await file.read()
    temp_path.write_bytes(contents)
    
    profile_service.set_img(uid, str(temp_path))
    
    # Regenerate local file
    output_path = f"static/img/{uid}_pfp.png"
    profile_service.get_img(uid, output_path)
    
    return RedirectResponse(url="/profile", status_code=303)
