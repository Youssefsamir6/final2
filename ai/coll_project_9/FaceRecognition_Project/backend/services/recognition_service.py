import threading
import cv2
import numpy as np
from pathlib import Path

from core_ai.face_detection import pad_image
from core_ai.face_recognitionV1 import identify
from core_ai.hybrid_recognition import HybridFaceDatabase, HybridFaceRecognizer
from core_ai.database import FaceDatabase
from config import FACE_DB_PATH, COSINE_THRESHOLD, QUALITY_SCALE


class RecognitionService:
    _lock = threading.Lock()

    def __init__(self):
        self._pure_db: FaceDatabase | None = None
        self._hybrid_db: HybridFaceDatabase | None = None
        self._hybrid_recog: HybridFaceRecognizer | None = None
        self._db_built = False


    def build_databases(self, model_service) -> None:
        """Build both pure and hybrid databases from FACE_DB_PATH."""
        with self._lock:
            pure_db = FaceDatabase(
                model_service.recognizer,
                model_service.detector,
                model_service.diem,
            )
            pure_db.build(str(FACE_DB_PATH))

            hybrid_db = HybridFaceDatabase(
                model_service.recognizer,
                model_service.detector,
                model_service.diem,
                model_service.handcrafted,
            )
            hybrid_db.build(str(FACE_DB_PATH))

            self._pure_db     = pure_db
            self._hybrid_db   = hybrid_db
            self._hybrid_recog = HybridFaceRecognizer(
                hybrid_db,
                threshold=COSINE_THRESHOLD,
                quality_scale=QUALITY_SCALE,
            )
            self._db_built = True

    def is_ready(self) -> bool:
        return self._db_built

    def update_hybrid_params(self, threshold: float, quality_scale: float) -> None:
        if self._hybrid_recog:
            self._hybrid_recog.threshold     = threshold
            self._hybrid_recog.quality_scale = quality_scale


    def recognize_pure(self, model_service, crop_bgr: np.ndarray) -> tuple[str, float]:
        """
        Run pure InsightFace recognition on a single face crop.
        Returns (identity, score).
        """
        if not self._db_built or self._pure_db is None:
            return "DB not built", 0.0

        enhanced = model_service.diem.process(crop_bgr)
        padded   = pad_image(enhanced, target_size=320)
        emb      = model_service.recognizer.get_embedding(padded)
        if emb is None:
            return "Unknown", 0.0
        return identify(emb, self._pure_db.database)

    def recognize_hybrid(self, model_service, crop_bgr: np.ndarray) -> tuple[str, float]:
        """
        Run hybrid (deep + LBP/HOG) recognition on a single face crop.
        Returns (identity, score).
        """
        if not self._db_built or self._hybrid_recog is None:
            return "DB not built", 0.0

        enhanced  = model_service.diem.process(crop_bgr)
        padded    = pad_image(enhanced, target_size=320)
        emb       = model_service.recognizer.get_embedding(padded)
        if emb is None:
            return "Unknown", 0.0
        hand_feat = model_service.handcrafted.extract(enhanced)
        return self._hybrid_recog.identify(emb, hand_feat, enhanced)


    @property
    def pure_db(self) -> FaceDatabase | None:
        return self._pure_db

    @property
    def hybrid_db(self) -> HybridFaceDatabase | None:
        return self._hybrid_db

    @property
    def hybrid_recog(self) -> HybridFaceRecognizer | None:
        return self._hybrid_recog


recognition_service = RecognitionService()
