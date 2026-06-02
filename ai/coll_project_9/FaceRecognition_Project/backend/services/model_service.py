import threading
import sys
import os

sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent.parent))

from config import WEIGHTS_PATH, INSIGHTFACE_MODEL, INSIGHTFACE_DET_SIZE, YOLO_CONF_THRESHOLD
from core_ai.face_detection import FaceDetector, pad_image
from core_ai.enhancement import DIEMPlus
from core_ai.face_recognitionV1 import FaceRecognizer
from core_ai.hybrid_recognition import HandcraftedFeatureExtractor


class ModelService:
    """Thread-safe lazy singleton for all ML models."""

    _lock = threading.Lock()
    _initialized = False

    def __init__(self):
        self.detector:    FaceDetector | None = None
        self.diem:        DIEMPlus | None = None
        self.recognizer:  FaceRecognizer | None = None
        self.handcrafted: HandcraftedFeatureExtractor | None = None

    def initialize(self) -> None:
        """Load models. Safe to call multiple times — only runs once."""
        with self._lock:
            if self._initialized:
                return

            if not WEIGHTS_PATH.exists():
                raise FileNotFoundError(
                    f"YOLO weights not found at: {WEIGHTS_PATH}\n"
                    "Set the PROJECT_BASE_DIR env variable or place best.pt in the project root."
                )

            print("[ModelService] Loading YOLO detector...")
            self.detector = FaceDetector(str(WEIGHTS_PATH), conf_threshold=YOLO_CONF_THRESHOLD)

            print("[ModelService] Loading DIEMPlus enhancer...")
            self.diem = DIEMPlus()

            print("[ModelService] Loading InsightFace recognizer...")
            self.recognizer = FaceRecognizer(det_size=INSIGHTFACE_DET_SIZE)

            print("[ModelService] Loading handcrafted feature extractor...")
            self.handcrafted = HandcraftedFeatureExtractor()

            ModelService._initialized = True
            print("[ModelService] All models loaded successfully.")

    def is_ready(self) -> bool:
        return self._initialized


model_service = ModelService()
