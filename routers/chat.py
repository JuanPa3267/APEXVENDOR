from fastapi import APIRouter, Request, Form, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from core.config import templates
from core.utils import render_messages, md_filter
import services.chat_service as chat_service
from services.profile_service import get_all_providers
from uuid import uuid4
from pathlib import Path

router = APIRouter()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.get("/chat", response_class=HTMLResponse)
async def chat(request: Request):
    """Serve the chat page."""
    uid = request.cookies.get("uid", "anon")
    history = chat_service.CHAT_HISTORY.get(uid, [])
    messages = render_messages(history)
    return templates.TemplateResponse(
        "chat.html",
        {"request": request, "title": "Chat", "messages": messages}
    )

@router.post("/generate", response_class=HTMLResponse)
async def generate(request: Request, prompt: str = Form(...)):
    """Generate a model response (HTML full render)."""
    uid = request.cookies.get("uid", "anon")
    history = chat_service.CHAT_HISTORY.get(uid, [])
    answer, history = chat_service.ask_gpt_chat(prompt, history)
    chat_service.CHAT_HISTORY[uid] = history
    messages = render_messages(history)
    return templates.TemplateResponse(
        "chat.html",
        {"request": request, "title": "Chat", "messages": messages}
    )

@router.post("/generate-json")
async def generate_json(request: Request, prompt: str = Form(...)):
    """Generate a model response (JSON, for AJAX)."""
    uid = request.cookies.get("uid", "anon")
    history = chat_service.CHAT_HISTORY.get(uid, [])
    answer, history = chat_service.ask_gpt_chat(prompt, history)
    chat_service.CHAT_HISTORY[uid] = history

    html = md_filter(answer)
    return JSONResponse({"answer": answer, "html": html})

@router.post("/reset-chat")
async def reset_chat(request: Request):
    """Clears chat history."""
    uid = request.cookies.get("uid", "anon")
    chat_service.CHAT_HISTORY.pop(uid, None)
    url = request.url_for("chat")
    resp = RedirectResponse(url=url, status_code=303)
    resp.headers["Cache-Control"] = "no-store"
    return resp

@router.get("/reset-chat")
async def reset_chat_get(request: Request):
    return await reset_chat(request)

@router.post("/upload-pdf")
async def upload_pdf(request: Request, file: UploadFile = File(...)):
    """Upload PDF and summarize."""
    if file.content_type != "application/pdf" and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=415, detail="Solo se aceptan archivos PDF.")

    original_name = Path(file.filename).name
    fname = f"{uuid4().hex}.pdf"
    dest = UPLOAD_DIR / fname
    dest.write_bytes(await file.read())
    url = f"/uploads/{fname}"

    raw_text = chat_service.get_pdf_text(str(dest))
    # Fetch providers for context
    provs = get_all_providers()
    context = chat_service.summarize_pdf_text(original_name, raw_text, provs)

    uid = request.cookies.get("uid", "anon")
    history = chat_service.CHAT_HISTORY.get(uid, [])
    
    md_msg = f"**PDF recibido:** [{original_name}]({url})\n\n**Contexto breve:**\n{context}"
    history += [
        {"role": "user",  "parts": [f"PDF subido: {original_name}"]},
        {"role": "model", "parts": [md_msg]},
    ]
    chat_service.CHAT_HISTORY[uid] = history

    html_msg = md_filter(md_msg)
    return JSONResponse({
        "ok": True,
        "name": original_name,
        "url": url,
        "message": md_msg,
        "html": html_msg
    })
