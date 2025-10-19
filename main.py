"""FastAPI application entrypoint.

This module wires the web UI, chat endpoints, PDF upload/summarization,
and a minimal in-memory chat history keyed by user id.
"""

import os
from fastapi import FastAPI, Request, Form, UploadFile, File, HTTPException, Request
from fastapi.responses import HTMLResponse, PlainTextResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from generate_answer import ask_gpt_chat, get_pdf_text, summarize_pdf_text
import uvicorn
import markdown
from typing import List, Dict
from pathlib import Path
from uuid import uuid4
import profile_info
import registerstuff
import re

import connector


def _unwrap_markdown_fence(text: str) -> str:
    """
    Si el texto viene envuelto en un fence externo ```markdown o ```md,
    devuelve solo el contenido interno para que el parser no lo trate como código literal.
    """
    if not text:
        return ""
    t = text.strip()
    if t.startswith("```") and t.endswith("```"):
        # primera línea: ```markdown, ```md o ``` (vacío)
        first_nl = t.find("\n")
        if first_nl != -1:
            lang = t[3:first_nl].strip().lower()
            if lang in ("", "md", "markdown"):
                return t[first_nl + 1:-3].lstrip("\n")
    return text


def md_filter(text: str) -> str:
    """Renderiza Markdown a HTML, tolerando entradas vacías o con fence externo.

    Args:
        text: Texto Markdown crudo (posiblemente envuelto en ```markdown).

    Returns:
        HTML producido por el renderer de Python-Markdown.
    """
    if not text or not text.strip():
        return ""

    text = _unwrap_markdown_fence(text)

    # Extensiones base de Python-Markdown
    extensions = [
        "fenced_code",
        "codehilite",
        "tables",
        "sane_lists",
        "abbr",
        "attr_list",
        "def_list",
        "footnotes",
        "toc",
        "nl2br",
        "md_in_html",
    ]

    extension_configs = {
        "codehilite": {
            "linenums": False,
            "guess_lang": False,
            "noclasses": False,  # usa clases CSS -> recuerda incluir CSS de Pygments
        },
        "toc": {
            "permalink": True,   # añade ancla clickable en los encabezados
        },
    }

    # Si pymdown-extensions está disponible, añadimos mejoras (opcional)
    try:
        import pymdownx  # noqa: F401
        extensions += [
            "pymdownx.superfences",  # fences anidados/mixtos más robustos
            "pymdownx.highlight",    # mejor integración con Pygments
            "pymdownx.tasklist",     # [ ] y [x] en listas
            "pymdownx.tilde",        # ~~tachado~~
            "pymdownx.magiclink",    # autolink de URLs y @user/#123
        ]
        extension_configs.update({
            "pymdownx.highlight": {
                "linenums": False,
                "guess_lang": False,
                "anchor_linenums": False,
            },
            "pymdownx.tasklist": {
                "custom_checkbox": True
            }
        })
    except Exception:
        # Si no está instalado, seguimos con lo base sin fallar.
        pass

    return markdown.markdown(
        text,
        extensions=extensions,
        extension_configs=extension_configs,
        output_format="html5",
    )


def _render_messages(history: List[Dict]) -> List[Dict]:
    """Transform Gemini chat history dicts into a minimal UI-friendly shape.

    Args:
        history: List of messages as returned by the Gemini chat API.

    Returns:
        List of dicts with only role and flattened text for templating.
    """
    msgs = []
    for m in history:
        text = (m.get("parts") or [""])[0]
        msgs.append({"role": m.get("role", "model"), "text": text})
    return msgs


app = FastAPI()
templates = Jinja2Templates(directory="templates")
templates.env.filters["md"] = md_filter
app.mount("/static", StaticFiles(directory="static"), name="static")
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

CHAT_HISTORY: dict[str, list[dict]] = {}


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """Serve login page."""
    return templates.TemplateResponse("login.html", {"request": request, "title": "Iniciar sesión"})


@app.get("/register", response_class=HTMLResponse)
async def read_register(request: Request):
    """Serve registration page."""
    return templates.TemplateResponse("register.html", {"request": request, "title": "Registrarse"})


@app.post("/register", response_class=HTMLResponse)
async def register(
    request: Request,
    name: str = Form(...),
    password: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    country: str = Form(...),
    city: str = Form(...)
):

    formatted_name = name.lower().split(" ")[0]

    if formatted_name == "fabian":
        formatted_name = "favian"

    username = registerstuff.username_gen(name=formatted_name)

    context = {
        "name": name,
        "email": email,
        "phone": phone,
        "country": country,
        "city": city,
        "username": username
    }

    connector.register(username, password, name, email, phone, country, city)
    registerstuff.send_html_email(email, "Registro exitoso",
                                  "templates/register_mail.html", context)

    return templates.TemplateResponse(
        "register.html", {"request": request, "title": "Registrarse", "success": "Usuario registrado exitosamente"})


@app.post("/login", response_class=HTMLResponse)
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    """Log the user in (no validation here) and set a simple uid cookie."""
    # Authenticate user with error handling
    try:
        is_valid = connector.login(username, password)
    except Exception:
        # Internal error during authentication, show login page without crashing
        return templates.TemplateResponse(
            "login.html",
            {"request": request, "title": "Login",
                "error": "Error interno durante la autenticación, inténtalo más tarde."},
            status_code=500
        )
    if not is_valid:
        return templates.TemplateResponse(
            "login.html", {"request": request, "title": "Login", "error": "Usuario o contraseña incorrectos"}, status_code=401)

    # Generate response and set session cookie
    response = templates.TemplateResponse(
        "chat.html", {"request": request, "title": "Chat"})
    response.set_cookie("uid", username, httponly=True, samesite="lax")

    # Load user profile with error handling
    try:
        profile_info.set_profile(username)
    except Exception as e:
        # Error loading profile, log and proceed with defaults
        print(f"Error loading user profile: {e}")
        # continue to chat with default profile data
        pass
    return response


@app.get("/chat", response_class=HTMLResponse)
async def chat(request: Request):
    """Serve the chat page with the current user's message history."""
    uid = request.cookies.get("uid", "anon")
    history = CHAT_HISTORY.get(uid, [])
    messages = _render_messages(history)
    return templates.TemplateResponse(
        "chat.html",
        {"request": request, "title": "Chat", "messages": messages}
    )


@app.post("/generate-json")
async def generate_json(request: Request, prompt: str = Form(...)):
    uid = request.cookies.get("uid", "anon")
    history = CHAT_HISTORY.get(uid, [])
    answer, history = ask_gpt_chat(prompt, history)
    CHAT_HISTORY[uid] = history

    # <<< render en servidor (desfencea + extensiones)
    html = md_filter(answer)
    return JSONResponse({"answer": answer, "html": html})


@app.post("/generate", response_class=HTMLResponse)
async def generate(request: Request, prompt: str = Form(...)):
    """Generate a model response and re-render the chat template."""
    uid = request.cookies.get("uid", "anon")
    history = CHAT_HISTORY.get(uid, [])
    answer, history = ask_gpt_chat(prompt, history)
    CHAT_HISTORY[uid] = history
    messages = _render_messages(history)
    return templates.TemplateResponse(
        "chat.html",
        {"request": request, "title": "Chat", "messages": messages}
    )


@app.post("/reset-chat")
async def reset_chat(request: Request):
    """Limpia el historial del usuario y redirige al chat (GET) de forma segura."""
    uid = request.cookies.get("uid", "anon")
    # Limpia el historial (en vez de no-hacer-nada)
    CHAT_HISTORY.pop(uid, None)

    # Construye la URL con url_for (evita problemas de prefijo/root_path)
    url = request.url_for("chat")

    # 303 = See Other -> obliga a hacer GET a la nueva URL (ideal tras POST)
    resp = RedirectResponse(url=url, status_code=303)

    # Si también quieres "cerrar sesión", descomenta:
    # resp.delete_cookie("uid")

    # Evita cachear el redirect
    resp.headers["Cache-Control"] = "no-store"
    return resp

# (Opcional) soporta también GET por si usas enlaces en vez de formularios


@app.get("/reset-chat")
async def reset_chat_get(request: Request):
    return await reset_chat(request)


@app.post("/upload-pdf")
async def upload_pdf(request: Request, file: UploadFile = File(...)):
    """Accept a PDF, extract and summarize text, and append to chat history."""
    if file.content_type != "application/pdf" and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=415, detail="Solo se aceptan archivos PDF.")

    original_name = Path(file.filename).name
    fname = f"{uuid4().hex}.pdf"
    dest = UPLOAD_DIR / fname
    dest.write_bytes(await file.read())
    url = f"/uploads/{fname}"

    raw_text = get_pdf_text(str(dest))
    context = summarize_pdf_text(original_name, raw_text)

    uid = request.cookies.get("uid", "anon")
    history = CHAT_HISTORY.get(uid, [])
    md_msg = f"**PDF recibido:** [{original_name}]({url})\n\n**Contexto breve:**\n{context}"
    # Guarda markdown en el historial (plantilla server lo renderiza)
    history += [
        {"role": "user",  "parts": [f"📎 PDF subido: {original_name}"]},
        {"role": "model", "parts": [md_msg]},
    ]
    CHAT_HISTORY[uid] = history

    # También envía HTML directo para el flujo asíncrono
    html_msg = md_filter(md_msg)
    return JSONResponse({
        "ok": True,
        "name": original_name,
        "url": url,
        "message": md_msg,
        "html": html_msg
    })


@app.get("/profile")
async def profile(request: Request):
    """Serve the profile page with static demo user information."""
    username, name, email, phone, role, score, country, city, social_media, website, linkedin, github = profile_info.get_profile()
    print(username)
    pfp = connector.get_img(username, f"static/img/{username}_pfp.png")
    print(pfp)

    return templates.TemplateResponse("profile.html", {"request": request, "title": "Profile", "name": name, "email": email, "phone": phone, "role": role, "score": score, "country": country, "city": city, "social_media": social_media, "website": website, "linkedin": linkedin, "github": github, "pfp": pfp})
