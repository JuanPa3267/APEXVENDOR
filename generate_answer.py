# generate_answer.py
import os
import google.generativeai as genai
from dotenv import load_dotenv
import time
from PyPDF2 import PdfReader

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

SYSTEM_CTX = "Responde en Markdown en español."
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=SYSTEM_CTX,
    generation_config={"temperature": 0.4}
)

MAX_PDF_PAGES = 500       # lee hasta 5 páginas para contexto
MAX_CHARS = 500000        # evita inputs gigantes


def get_pdf_text(file_path: str, max_pages: int = MAX_PDF_PAGES, max_chars: int = MAX_CHARS) -> str:
    if not file_path:
        return ""
    text = []
    try:
        reader = PdfReader(file_path)
        for i, page in enumerate(reader.pages[:max_pages]):
            txt = page.extract_text() or ""
            text.append(txt)
            if sum(len(t) for t in text) >= max_chars:
                break
    except Exception:
        return ""
    merged = "\n".join(text).strip()
    return merged[:MAX_CHARS]


def summarize_pdf_text(name: str, text: str) -> str:
    if not text.strip():
        return "_No se pudo extraer texto del PDF (posible escaneado o protegido)._"
    prompt = f"""
    {name} es un proyecto, su texto es:
    {text}
    de que trata? y cuales son las caracteristicas
    del proyecto? y que caracteristicas deberia
    tener un proveedor(desarrollador tambien)
    para que el proyecto sea exitoso? Tanto blandas como duras,
    y que tipo de proveedor deberia ser? Responde en español y en Markdown.
    """
    try:
        resp = model.generate_content(prompt)
        return resp.text or "_No hay resumen disponible._"
    except Exception:
        return "_No fue posible generar el resumen._"


def ask_gpt_chat(prompt: str, history: list[dict]) -> tuple[str, list[dict]]:
    start_time = time.time()
    chat = model.start_chat(history=history)
    resp = chat.send_message(prompt)
    answer = resp.text or ""
    end_time = time.time()
    print(f"Time taken: {round(end_time - start_time, 2)} seconds")
    history += [
        {"role": "user",  "parts": [prompt]},
        {"role": "model", "parts": [answer]},
    ]
    return answer, history
