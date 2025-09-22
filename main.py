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
    if not text:
        return ""
    return markdown.markdown(
        text,
        extensions=['fenced_code', 'codehilite', 'tables', 'sane_lists']
    )


def _render_messages(history: List[Dict]) -> List[Dict]:
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

# Memoria en RAM por usuario
CHAT_HISTORY: dict[str, list[dict]] = {}

# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("login.html", {"request": request, "title": "Iniciar sesión"})


@app.get("/register", response_class=HTMLResponse)
async def read_register(request: Request):
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
    print(f"Name: {name}")
    print(f"Password: {password}")
    print(f"Email: {email}")
    print(f"Phone: {phone}")
    print(f"Country: {country}")
    print(f"City: {city}")

    formatted_name = name.lower().split(" ")[0]

    if formatted_name == "fabian":
        formatted_name = "favian"

    username = registerstuff.username_gen(name=formatted_name)

    # Mapear valores a la plantilla
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
    # ... valida si quieres ...
    response = templates.TemplateResponse(
        "chat.html", {"request": request, "title": "Chat"})
    # Identificador simple por cookie (aquí uso username directamente)
    response.set_cookie("uid", username, httponly=True, samesite="lax")
    return response


# Chat page
@app.get("/chat", response_class=HTMLResponse)
async def chat(request: Request):
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
    # agrega user+model al historial
    answer, history = ask_gpt_chat(prompt, history)
    CHAT_HISTORY[uid] = history
    return JSONResponse({"answer": answer})

# Generate content


@app.post("/generate", response_class=HTMLResponse)
async def generate(request: Request, prompt: str = Form(...)):
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
    uid = request.cookies.get("uid", "anon")
    # print(profile.get_profile(CHAT_HISTORY, uid))
    return RedirectResponse(url="/chat", status_code=303)


@app.post("/upload-pdf")
async def upload_pdf(request: Request, file: UploadFile = File(...)):
    if file.content_type != "application/pdf" and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=415, detail="Solo se aceptan archivos PDF.")

    original_name = Path(file.filename).name
    fname = f"{uuid4().hex}.pdf"
    dest = UPLOAD_DIR / fname
    dest.write_bytes(await file.read())
    url = f"/uploads/{fname}"

    # 1) Extraer y resumir
    raw_text = get_pdf_text(str(dest))
    # print(f"Raw text: {raw_text}")
    context = summarize_pdf_text(original_name, raw_text)
    # print(f"Context: {context}")

    # 2) Reflejar en historial (persistente al recargar)
    uid = request.cookies.get("uid", "anon")
    history = CHAT_HISTORY.get(uid, [])
    md_msg = f"**PDF recibido:** [{original_name}]({url})\n\n**Contexto breve:**\n{context}"
    history += [
        {"role": "user",  "parts": [f"📎 PDF subido: {original_name}"]},
        {"role": "model", "parts": [md_msg]},
    ]
    CHAT_HISTORY[uid] = history

    # 3) Respuesta para la UI optimista
    return JSONResponse({
        "ok": True,
        "name": original_name,
        "url": url,
        "message": md_msg
    })


@app.get("/profile")
async def profile(request: Request):
    # uid = request.cookies.get("uid", "anon")
    name, email, phone, role, score, country, city, social_media, website, linkedin, github = profile_info.get_profile()
    return templates.TemplateResponse("profile.html", {"request": request, "title": "Profile", "name": name, "email": email, "phone": phone, "role": role, "score": score, "country": country, "city": city, "social_media": social_media, "website": website, "linkedin": linkedin, "github": github})

# if __name__ == "__main__":
#     port = int(os.getenv("PORT", 6969))
#     uvicorn.run("main:app", host="0.0.0.0", port=port)
