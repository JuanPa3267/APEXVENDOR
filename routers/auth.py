from fastapi import APIRouter, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from starlette.status import HTTP_303_SEE_OTHER
import services.auth_service as auth_service
from core.config import templates
from services.profile_service import get_profile_data # Needed for setting session or validating
from services.auth_service import get_user_by_email, user_is_admin

router = APIRouter()

@router.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """Serve login page."""
    return templates.TemplateResponse("login.html", {"request": request, "title": "Iniciar sesión"})


@router.get("/register", response_class=HTMLResponse)
async def read_register(request: Request):
    """Serve registration page."""
    return templates.TemplateResponse("register.html", {"request": request, "title": "Registrarse"})


@router.post("/register", response_class=HTMLResponse)
async def register(
    request: Request,
    name: str = Form(...),
    password: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    country: str = Form(...),
    city: str = Form(...),
    identificacion_nit: str = Form(...),
    tipo_proveedor: str = Form("Persona"),
    is_admin: bool = Form(True),
):
    formatted_name = name.lower().split(" ")[0]
    username = auth_service.username_gen(name=formatted_name, base="a" if is_admin else "p")

    context = {
        "name": formatted_name.capitalize(),
        "phone": phone,
        "city": city
    }

    ok = auth_service.register_user(
        username=username, password=password, email=email, phone=phone, city=city,
        tipo_proveedor=tipo_proveedor, identificacion_nit=identificacion_nit, is_admin=is_admin,
        name=name
    )
    
    if not ok:
        return templates.TemplateResponse(
            "register.html",
            {"request": request, "title": "Registrarse",
             "error": "No se pudo registrar el usuario. Verifica los datos e inténtalo de nuevo."},
            status_code=500
        )

    auth_service.send_html_email(email, "Registro exitoso", "templates/register_mail.html", context)

    return templates.TemplateResponse(
        "register.html",
        {"request": request, "title": "Registrarse", "success": "Usuario registrado exitosamente"}
    )


@router.get("/register_p", response_class=HTMLResponse)
async def read_register_p(request: Request):
    """Serve registration page for providers."""
    return templates.TemplateResponse("register_p.html", {"request": request, "title": "Registrarse como proveedor"})


@router.post("/register_p", response_class=HTMLResponse)
async def register_p(
    request: Request,
    nombre_legal: str = Form(""),
    nombres_apellidos: str = Form(...),
    password: str = Form(...),
    correo: str = Form(...),
    identificacion_nit: str = Form(...),
    telefono: str = Form(...),
    direccion: str = Form(...),
    ciudad: str = Form(...),
    portafolio_resumen: str = Form(...),
    tipo_proveedor: str = Form("Persona"),
    is_admin: bool = Form(False),
):
    formatted_name = nombres_apellidos.lower().split(" ")[0]
    username = auth_service.username_gen(name=formatted_name, base="p")

    context = {
        "name": formatted_name.capitalize(),
        "phone": telefono,
        "city": ciudad
    }

    ok = auth_service.register_user(
        username=username, password=password, email=correo, 
        nombre_legal=nombre_legal, nombres_apellidos=nombres_apellidos,
        identificacion_nit=identificacion_nit, telefono=telefono, direccion=direccion,
        city=ciudad, portafolio_resumen=portafolio_resumen, tipo_proveedor=tipo_proveedor,
        is_admin=is_admin
    )

    if not ok:
        return templates.TemplateResponse(
            "register_p.html",
            {"request": request, "title": "Registrarse como Proveedor",
             "error": "No se pudo registrar el usuario. Verifica los datos e inténtalo de nuevo."},
            status_code=500
        )

    auth_service.send_html_email(correo, "Registro exitoso", "templates/register_mail.html", context)

    return templates.TemplateResponse(
        "register_p.html",
        {"request": request, "title": "Registrarse como proveedor",
         "success": "Usuario registrado exitosamente"}
    )


@router.post("/login", response_class=HTMLResponse)
async def login(request: Request, email: str = Form(...), password: str = Form(...)):
    """Authenticates by email and redirects based on role."""
    is_valid = auth_service.login_with_email(email, password)
    
    if not is_valid:
        return templates.TemplateResponse(
            "login.html",
            {"request": request, "title": "Login", "error": "Correo o contraseña incorrectos"},
            status_code=401
        )

    u = get_user_by_email(email)
    if not u:
         return templates.TemplateResponse(
            "login.html",
            {"request": request, "title": "Login", "error": "Error interno cargando usuario."},
            status_code=500
        )

    is_admin_user = user_is_admin(u["id_usuario"])
    username = u["username"]

    if is_admin_user:
        resp = RedirectResponse(url="/admin", status_code=HTTP_303_SEE_OTHER)
        resp.set_cookie("uid", username, httponly=True, samesite="lax")
        resp.set_cookie("role", "admin", httponly=False, samesite="lax")
        return resp
    else:
        resp = RedirectResponse(url="/profile", status_code=HTTP_303_SEE_OTHER)
        resp.set_cookie("uid", username, httponly=True, samesite="lax")
        resp.set_cookie("role", "provider", httponly=False, samesite="lax")
        return resp
