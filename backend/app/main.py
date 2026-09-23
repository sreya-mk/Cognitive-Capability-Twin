from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import profile

app = FastAPI(title="Cognitive Capability Twin Backend")

# Allow frontend dev server to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(profile.router)

# Initialize DB on startup
@app.on_event("startup")
async def on_startup():
    init_db()
