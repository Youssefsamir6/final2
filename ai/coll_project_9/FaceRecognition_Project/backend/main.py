from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.model_service import model_service
from config import FACE_DB_PATH, FACE_TEST_PATH
from utils.image_utils import ensure_dirs


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_dirs(FACE_DB_PATH, FACE_TEST_PATH)
    print("[Startup] Directories verified.")
    model_service.initialize()
    yield
    print("[Shutdown] Cleaning up...")


app = FastAPI(
    title="Face Recognition System",
    version="1.0.0",
    description="Production-grade hybrid face recognition API",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.realtime import router as realtime_router
from routes.pipeline import router as pipeline_router
from routes.database import router as database_router
from routes.dataset import router as dataset_router

app.include_router(realtime_router, prefix="/realtime", tags=["Realtime"])
app.include_router(pipeline_router, prefix="/pipeline", tags=["Pipeline"])
app.include_router(database_router, prefix="/database", tags=["Database"])
app.include_router(dataset_router, prefix="/dataset", tags=["Dataset"])


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "models_loaded": model_service.is_ready(),
    }