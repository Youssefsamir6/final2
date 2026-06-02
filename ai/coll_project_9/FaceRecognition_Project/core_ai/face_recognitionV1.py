import numpy as np
from insightface.app import FaceAnalysis


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def identify(embedding, database, threshold=0.5):
    best_score = -1
    identity = "Unknown"
    for person, embeddings in database.items():
        for db_emb in embeddings:
            score = cosine_similarity(embedding, db_emb)
            if score > best_score:
                best_score = score
                identity = person
    if best_score < threshold:
        identity = "Unknown"
    return identity, best_score


class FaceRecognizer:
    def __init__(self, det_size=(320, 320)):
        self.app = FaceAnalysis(name="buffalo_l")
        self.app.prepare(ctx_id=0, det_size=det_size)

    def get_embedding(self, face_image):
        faces = self.app.get(face_image)
        if len(faces) == 0:
            return None
        return faces[0].embedding