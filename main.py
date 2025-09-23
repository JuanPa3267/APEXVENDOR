"""FastAPI application entrypoint.

This module wires the web UI, chat endpoints, PDF upload/summarization,
and a minimal in-memory chat history keyed by user id.
"""

import os
from fastapi import FastAPI, Request, Form, UploadFile, File, HTTPException
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


def md_filter(text: str) -> str:
    """Render a Markdown string to HTML, tolerating empty inputs.

    Args:
        text: Raw Markdown text.

    Returns:
        HTML string produced by Markdown renderer.
    """
    if not text:
        return ""
    return markdown.markdown(
        text,
        extensions=['fenced_code', 'codehilite', 'tables', 'sane_lists']
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
    """Handle registration form submission and send confirmation email."""

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

    registerstuff.send_html_email(email, "Registro exitoso",
                                  "templates/register_mail.html", context)

    return templates.TemplateResponse(
        "register.html", {"request": request, "title": "Registrarse"}
    )


@app.post("/login", response_class=HTMLResponse)
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    """Log the user in (no validation here) and set a simple uid cookie."""
    response = templates.TemplateResponse(
        "chat.html", {"request": request, "title": "Chat"})
    response.set_cookie("uid", username, httponly=True, samesite="lax")
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
    """Generate a model response and return it as JSON while updating history."""
    uid = request.cookies.get("uid", "anon")
    history = CHAT_HISTORY.get(uid, [])
    answer, history = ask_gpt_chat(prompt, history)
    CHAT_HISTORY[uid] = history
    return JSONResponse({"answer": answer})

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
    """Redirect to chat; reserved for future history reset logic."""
    uid = request.cookies.get("uid", "anon")
    return RedirectResponse(url="/chat", status_code=303)


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
    history += [
        {"role": "user",  "parts": [f"📎 PDF subido: {original_name}"]},
        {"role": "model", "parts": [md_msg]},
    ]
    CHAT_HISTORY[uid] = history

    return JSONResponse({
        "ok": True,
        "name": original_name,
        "url": url,
        "message": md_msg
    })


@app.get("/profile")
async def profile(request: Request):
    """Serve the profile page with static demo user information."""
    name, email, phone, role, score, country, city, social_media, website, linkedin, github = profile_info.get_profile()
    return templates.TemplateResponse("profile.html", {"request": request, "title": "Profile", "name": name, "email": email, "phone": phone, "role": role, "score": score, "country": country, "city": city, "social_media": social_media, "website": website, "linkedin": linkedin, "github": github})

