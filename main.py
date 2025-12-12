"""FastAPI application entrypoint.

Refactored to Modular Monolith architecture.
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Import routers
from routers import auth, profile, chat, admin

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(chat.router)
app.include_router(admin.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=6969)
