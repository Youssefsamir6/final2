import os
import numpy as np
import cv2
from core_ai.face_detection import pad_image
from core_ai.face_recognitionV1 import cosine_similarity


def get_image_quality(image):
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    return lap_var


class HandcraftedFeatureExtractor:

    def __init__(self):
        self.hog = cv2.HOGDescriptor(
            (64, 128),
            (16, 16),
            (8, 8),
            (8, 8),
            9
        )

    def extract(self, image):
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        lbp_hist = self._extract_lbp(gray)
        resized = cv2.resize(gray, (64, 128))
        hog_feat = self.hog.compute(resized).flatten()

        return np.concatenate((lbp_hist, hog_feat))

    def _extract_lbp(self, gray):
        rows, cols = gray.shape
        lbp = np.zeros((rows, cols), dtype=np.uint8)
        for i in range(1, rows - 1):
            for j in range(1, cols - 1):
                center = gray[i, j]
                code = 0
                code |= (gray[i - 1, j - 1] >= center) << 7
                code |= (gray[i - 1, j] >= center) << 6
                code |= (gray[i - 1, j + 1] >= center) << 5
                code |= (gray[i, j - 1] >= center) << 4
                code |= (gray[i, j + 1] >= center) << 3
                code |= (gray[i + 1, j - 1] >= center) << 2
                code |= (gray[i + 1, j] >= center) << 1
                code |= (gray[i + 1, j + 1] >= center) << 0
                lbp[i, j] = code
        hist, _ = np.histogram(lbp.ravel(), bins=256, range=(0, 255))
        hist = hist.astype(np.float32)
        hist /= (hist.sum() + 1e-7)
        return hist


class HybridFaceDatabase:

    def __init__(self, recognizer, detector, diem, handcrafted_extractor):
        self.recognizer = recognizer
        self.detector = detector
        self.diem = diem
        self.handcrafted = handcrafted_extractor
        self.database = {}  

    def build(self, db_path):
        print("Building hybrid face database...")
        for person in os.listdir(db_path):
            print(f"Scanning: {person}")
            person_path = os.path.join(db_path, person)
            if not os.path.isdir(person_path):
                continue
            features_list = []
            for img_name in os.listdir(person_path):
                img_path = os.path.join(person_path, img_name)
                img = cv2.imread(img_path)
                if img is None:
                    continue
                faces = self.detector.detect(img, extract_crops=True)
                if not faces:
                    continue
                face = max(faces, key=lambda f: f.confidence)
                crop = face.crop
                if crop.size == 0:
                    continue
                enhanced = self.diem.process(crop)
                padded = pad_image(enhanced, target_size=320)
                emb = self.recognizer.get_embedding(padded)
                if emb is None:
                    print(f"InsightFace failed in {img_name}")
                    continue
                hand_feat = self.handcrafted.extract(enhanced)
                features_list.append((emb, hand_feat))
            if features_list:
                self.database[person] = features_list
            else:
                print(f"No features for {person}")
        print(f"Hybrid Database ready: {list(self.database.keys())}")


class HybridFaceRecognizer:

    def __init__(self, hybrid_database, threshold=0.5, quality_scale=500.0):
        self.database = hybrid_database.database
        self.threshold = threshold
        self.quality_scale = quality_scale 

    def identify(self, embedding, hand_feat, enhanced_crop):
        quality = get_image_quality(enhanced_crop)
        weight_deep = min(1.0, max(0.0, quality / self.quality_scale))
        weight_hand = 1.0 - weight_deep

        best_score = -1
        identity = "Unknown"
        for person, feats_list in self.database.items():
            for db_emb, db_hand in feats_list:
                deep_sim = cosine_similarity(embedding, db_emb)
                hand_sim = cosine_similarity(hand_feat, db_hand)
                fused_score = weight_deep * deep_sim + weight_hand * hand_sim
                if fused_score > best_score:
                    best_score = fused_score
                    identity = person

        if best_score < self.threshold:
            identity = "Unknown"
        return identity, best_score