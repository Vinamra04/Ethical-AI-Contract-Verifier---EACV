from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.startup import load_model
from api.routes import analyze, history, account

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model(app)
    yield

app = FastAPI(title="EACV API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
app.include_router(history.router, prefix="/history", tags=["history"])
app.include_router(account.router, prefix="/account", tags=["account"])

@app.get("/health")
def health():
    return {"status": "ok"}
