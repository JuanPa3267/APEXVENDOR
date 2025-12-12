from fastapi.templating import Jinja2Templates
from core.utils import md_filter

templates = Jinja2Templates(directory="templates")
templates.env.filters["md"] = md_filter
