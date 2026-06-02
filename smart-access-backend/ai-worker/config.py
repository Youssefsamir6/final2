# AI Worker Configuration Module
# Standalone configuration that doesn't depend on the full FaceRecognition_Project backend

import os
from pathlib import Path

# Base directory for face recognition project
BASE_DIR = Path(os.getenv("PROJECT_BASE_DIR", 
                         Path(__file__).parent.parent / "coll_project_9" / "FaceRecognition_Project")).resolve()

# Face database paths
FACE_DB_PATH = BASE_DIR / os.getenv("FACE_DB_DIR", "face_database")
FACE_TEST_PATH = BASE_DIR / os.getenv("FACE_TEST_DIR", "face_test")
WEIGHTS_PATH = BASE_DIR / os.getenv("YOLO_WEIGHTS", "best.pt")

# Model configuration
INSIGHTFACE_MODEL = os.getenv("INSIGHTFACE_MODEL", "buffalo_l")
INSIGHTFACE_DET_SIZE = (320, 320)

# Detection thresholds
YOLO_CONF_THRESHOLD = float(os.getenv("YOLO_CONF", "0.55"))
PAD_TARGET_SIZE = 320

# Recognition thresholds
COSINE_THRESHOLD = float(os.getenv("COSINE_THRESHOLD", "0.5"))
QUALITY_SCALE = float(os.getenv("QUALITY_SCALE", "500.0"))

# Genetic algorithm parameters (for model optimization)
GA_POPULATION = int(os.getenv("GA_POPULATION", "15"))
GA_GENERATIONS = int(os.getenv("GA_GENERATIONS", "8"))
GA_MUTATION = float(os.getenv("GA_MUTATION", "0.15"))

# Image settings
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB

# Streaming configuration
STREAM_FPS_LIMIT = int(os.getenv("STREAM_FPS", "30"))

# Embedding dimension
EMBEDDING_DIM = 512  # InsightFace uses 512-dimensional embeddings
