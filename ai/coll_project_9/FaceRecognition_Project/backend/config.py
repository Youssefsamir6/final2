import os
from pathlib import Path

BASE_DIR = Path(os.getenv("PROJECT_BASE_DIR", Path(__file__).parent.parent)).resolve()

FACE_DB_PATH   = BASE_DIR / os.getenv("FACE_DB_DIR",   "face_database")
FACE_TEST_PATH = BASE_DIR / os.getenv("FACE_TEST_DIR", "face_test")
WEIGHTS_PATH   = BASE_DIR / os.getenv("YOLO_WEIGHTS",  "best.pt")

INSIGHTFACE_MODEL  = os.getenv("INSIGHTFACE_MODEL", "buffalo_l")
INSIGHTFACE_DET_SIZE = (320, 320)

YOLO_CONF_THRESHOLD = float(os.getenv("YOLO_CONF", "0.55"))
PAD_TARGET_SIZE     = 320

COSINE_THRESHOLD  = float(os.getenv("COSINE_THRESHOLD", "0.5"))
QUALITY_SCALE     = float(os.getenv("QUALITY_SCALE",    "500.0"))

GA_POPULATION  = int(os.getenv("GA_POPULATION",  "15"))
GA_GENERATIONS = int(os.getenv("GA_GENERATIONS", "8"))
GA_MUTATION    = float(os.getenv("GA_MUTATION",  "0.15"))

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

STREAM_FPS_LIMIT = int(os.getenv("STREAM_FPS", "30"))
