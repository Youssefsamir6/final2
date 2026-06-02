import os
import time
import threading
import cv2
import numpy as np
from pathlib import Path

from core_ai.face_detection import pad_image
from core_ai.face_recognitionV1 import identify
from core_ai.hybrid_recognition import HybridFaceRecognizer, HybridFaceDatabase
from core_ai.database import FaceDatabase
from core_ai.hybrid_recognition import HybridFaceDatabase
from core_ai.genetic_optimizer import GeneticOptimizer
from core_ai.benchmarking import Benchmarking
from services.validation_service import validation_service
from services.recognition_service import recognition_service
from config import (
    FACE_DB_PATH, FACE_TEST_PATH,
    COSINE_THRESHOLD, QUALITY_SCALE,
    GA_POPULATION, GA_GENERATIONS, GA_MUTATION,
)



class PipelineProgress:
    def __init__(self):
        self.stage:   str   = "idle"
        self.percent: int   = 0
        self.message: str   = ""
        self.running: bool  = False
        self.error:   str | None = None
        self.result:  dict | None = None

    def update(self, stage: str, percent: int, message: str = ""):
        self.stage   = stage
        self.percent = percent
        self.message = message

    def to_dict(self) -> dict:
        return {
            "stage":   self.stage,
            "percent": self.percent,
            "message": self.message,
            "running": self.running,
            "error":   self.error,
        }



class PipelineService:
    def __init__(self):
        self.progress  = PipelineProgress()
        self._lock     = threading.Lock()
        self._thread:  threading.Thread | None = None


    def is_running(self) -> bool:
        return self.progress.running

    def get_progress(self) -> dict:
        return self.progress.to_dict()

    def start(self, model_service) -> None:
        """Start pipeline in background thread (non-blocking)."""
        with self._lock:
            if self.progress.running:
                raise RuntimeError("Pipeline is already running.")
            self.progress = PipelineProgress()
            self.progress.running = True
            self._thread = threading.Thread(
                target=self._run,
                args=(model_service,),
                daemon=True,
            )
            self._thread.start()

    def get_result(self) -> dict | None:
        return self.progress.result


    def _run(self, model_service) -> None:
        try:
            p = self.progress

            p.update("validation", 5, "Checking database vs test set...")
            validation = validation_service.check()
            if not validation.valid:
                raise ValueError(
                    f"Validation failed. Missing test data for: {validation.missing_people}"
                )

            p.update("building_db", 15, "Building pure InsightFace database...")
            pure_db = FaceDatabase(
                model_service.recognizer,
                model_service.detector,
                model_service.diem,
            )
            pure_db.build(str(FACE_DB_PATH))

            p.update("building_db", 30, "Building hybrid feature database...")
            hybrid_db = HybridFaceDatabase(
                model_service.recognizer,
                model_service.detector,
                model_service.diem,
                model_service.handcrafted,
            )
            hybrid_db.build(str(FACE_DB_PATH))

            recognition_service._pure_db      = pure_db
            recognition_service._hybrid_db    = hybrid_db
            recognition_service._hybrid_recog = HybridFaceRecognizer(
                hybrid_db, threshold=COSINE_THRESHOLD, quality_scale=QUALITY_SCALE
            )
            recognition_service._db_built = True

            p.update("loading_test", 40, "Loading test dataset...")
            test_images, test_labels = self._load_test_data(str(FACE_TEST_PATH))
            if not test_images:
                raise ValueError("No test images found in face_test/")

            p.update("optimizing", 50, "Running Genetic Algorithm optimization...")
            optimizer    = GeneticOptimizer(GA_POPULATION, GA_GENERATIONS, GA_MUTATION)
            fitness_func = self._make_fitness(
                test_images, test_labels,
                model_service, hybrid_db,
            )
            bounds = [
                (0.3,  0.7),    
                (100,  2000),  
                (3,    9),      
                (10,   100),  
                (10,   100),   
            ]
            best_params, best_fitness = optimizer.optimize(fitness_func, bounds, verbose=True)

            opt_threshold    = float(best_params[0])
            opt_quality_scale = float(best_params[1])
            opt_d            = int(best_params[2])
            opt_sc           = float(best_params[3])
            opt_ss           = float(best_params[4])

            optimized_recog = HybridFaceRecognizer(
                hybrid_db,
                threshold=opt_threshold,
                quality_scale=opt_quality_scale,
            )
            recognition_service._hybrid_recog = optimized_recog
            recognition_service._hybrid_recog.threshold     = opt_threshold
            recognition_service._hybrid_recog.quality_scale = opt_quality_scale

            p.update("benchmarking", 75, "Running benchmark on test set...")
            pure_preds,   pure_times   = [], []
            hybrid_preds, hybrid_times = [], []

            for img in test_images:
                t0 = time.time()
                pred_pure = self._run_pure(img, model_service, pure_db)
                pure_times.append(time.time() - t0)
                pure_preds.append(pred_pure)

               
                t0 = time.time()
                pred_hybrid = self._run_hybrid(
                    img, model_service, optimized_recog, opt_d, opt_sc, opt_ss
                )
                hybrid_times.append(time.time() - t0)
                hybrid_preds.append(pred_hybrid)

            bench = Benchmarking()
            pure_m, hybrid_m, pure_fps, hybrid_fps = bench.benchmark(
                pure_preds, hybrid_preds, test_labels, pure_times, hybrid_times
            )

            p.update("done", 100, "Pipeline completed successfully.")

            unique_labels = sorted(set(test_labels))
            p.result = {
                "status": "success",
                "pure": {
                    "accuracy":  round(pure_m["accuracy"],  4),
                    "precision": round(pure_m["precision"], 4),
                    "recall":    round(pure_m["recall"],    4),
                    "f1_score":  round(pure_m["f1"],        4),
                    "fps":       round(pure_fps,            2),
                },
                "hybrid": {
                    "accuracy":  round(hybrid_m["accuracy"],  4),
                    "precision": round(hybrid_m["precision"], 4),
                    "recall":    round(hybrid_m["recall"],    4),
                    "f1_score":  round(hybrid_m["f1"],        4),
                    "fps":       round(hybrid_fps,            2),
                },
                "optimized_params": {
                    "threshold":     round(opt_threshold,     3),
                    "quality_scale": round(opt_quality_scale, 1),
                    "bilateral_d":   opt_d,
                    "sigma_color":   round(opt_sc, 1),
                    "sigma_space":   round(opt_ss, 1),
                    "best_fitness":  round(float(best_fitness), 4),
                },
                "confusion_matrix": hybrid_m["confusion_matrix"].tolist(),
                "class_labels":     unique_labels,
            }

        except Exception as exc:
            self.progress.error   = str(exc)
            self.progress.stage   = "error"
            self.progress.message = str(exc)
            print(f"[Pipeline] ERROR: {exc}")
        finally:
            self.progress.running = False


    @staticmethod
    def _load_test_data(test_path: str) -> tuple[list, list]:
        images, labels = [], []
        for person in os.listdir(test_path):
            person_path = os.path.join(test_path, person)
            if not os.path.isdir(person_path):
                continue
            for img_name in os.listdir(person_path):
                img = cv2.imread(os.path.join(person_path, img_name))
                if img is not None:
                    images.append(img)
                    labels.append(person)
        print(f"[Pipeline] Loaded {len(images)} test images from {len(set(labels))} identities.")
        return images, labels

    @staticmethod
    def _run_pure(image, model_service, pure_db) -> str:
        faces = model_service.detector.detect(image, extract_crops=True)
        if not faces:
            return "Unknown"
        face = max(faces, key=lambda f: f.confidence)
        if face.crop.size == 0:
            return "Unknown"
        enhanced = model_service.diem.process(face.crop)
        padded   = pad_image(enhanced)
        emb      = model_service.recognizer.get_embedding(padded)
        if emb is None:
            return "Unknown"
        identity, _ = identify(emb, pure_db.database)
        return identity

    @staticmethod
    def _run_hybrid(image, model_service, hybrid_recog, d, sc, ss) -> str:
        faces = model_service.detector.detect(image, extract_crops=True)
        if not faces:
            return "Unknown"
        face = max(faces, key=lambda f: f.confidence)
        if face.crop.size == 0:
            return "Unknown"
        enhanced = cv2.bilateralFilter(face.crop, d, sc, ss)
        padded   = pad_image(enhanced)
        emb      = model_service.recognizer.get_embedding(padded)
        if emb is None:
            return "Unknown"
        hand_feat        = model_service.handcrafted.extract(enhanced)
        identity, _      = hybrid_recog.identify(emb, hand_feat, enhanced)
        return identity

    @staticmethod
    def _make_fitness(test_images, test_labels, model_service, hybrid_db):
        """Returns a fitness function closed over test data."""
        def fitness(individual):
            thresh, q_scale, d, sc, ss = individual
            d = max(1, int(d)) | 1        
            temp_recog = HybridFaceRecognizer(
                hybrid_db, threshold=thresh, quality_scale=q_scale
            )
            correct = 0
            for img, label in zip(test_images, test_labels):
                faces = model_service.detector.detect(img, extract_crops=True)
                if not faces:
                    continue
                face = max(faces, key=lambda f: f.confidence)
                if face.crop.size == 0:
                    continue
                try:
                    enhanced  = cv2.bilateralFilter(face.crop, d, sc, ss)
                    padded    = pad_image(enhanced)
                    emb       = model_service.recognizer.get_embedding(padded)
                    if emb is None:
                        continue
                    hand_feat = model_service.handcrafted.extract(enhanced)
                    pred, _   = temp_recog.identify(emb, hand_feat, enhanced)
                    if pred == label:
                        correct += 1
                except Exception:
                    continue
            return correct / len(test_images) if test_images else 0.0
        return fitness


pipeline_service = PipelineService()
