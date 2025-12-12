import markdown
from typing import List, Dict

def _unwrap_markdown_fence(text: str) -> str:
    """
    Si el texto viene envuelto en un fence externo ```markdown o ```md,
    devuelve solo el contenido interno.
    """
    if not text:
        return ""
    t = text.strip()
    if t.startswith("```") and t.endswith("```"):
        first_nl = t.find("\n")
        if first_nl != -1:
            lang = t[3:first_nl].strip().lower()
            if lang in ("", "md", "markdown"):
                return t[first_nl + 1:-3].lstrip("\n")
    return text


def md_filter(text: str) -> str:
    """Renderiza Markdown a HTML."""
    if not text or not text.strip():
        return ""

    text = _unwrap_markdown_fence(text)

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
            "noclasses": False,
        },
        "toc": {
            "permalink": True,
        },
    }

    try:
        import pymdownx  # noqa: F401
        extensions += [
            "pymdownx.superfences",
            "pymdownx.highlight",
            "pymdownx.tasklist",
            "pymdownx.tilde",
            "pymdownx.magiclink",
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
        pass

    return markdown.markdown(
        text,
        extensions=extensions,
        extension_configs=extension_configs,
        output_format="html",
    )

def render_messages(history: List[Dict]) -> List[Dict]:
    """Transform Gemini chat history dicts into a minimal UI-friendly shape."""
    msgs = []
    for m in history:
        text = (m.get("parts") or [""])[0]
        msgs.append({"role": m.get("role", "model"), "text": text})
    return msgs
