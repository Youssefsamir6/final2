import asyncio
import time
import cv2
import numpy as np
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from services.model_service import model_service
from services.recognition_service import recognition_service
from config import STREAM_FPS_LIMIT

router = APIRouter()


_camera: cv2.VideoCapture | None = None
_streaming = False


def _get_camera() -> cv2.VideoCapture:
    global _camera
    if _camera is None or not _camera.isOpened():
        _camera = cv2.VideoCapture(0)
        if not _camera.isOpened():
            raise RuntimeError("Cannot open camera. Check that a webcam is connected.")
    return _camera


def _release_camera():
    global _camera, _streaming
    _streaming = False
    if _camera and _camera.isOpened():
        _camera.release()
    _camera = None



COLOR_BOX  = (0, 215, 255)   
COLOR_UNKN = (0, 0,   200)   
FONT       = cv2.FONT_HERSHEY_SIMPLEX


def _draw_faces(frame: np.ndarray, faces) -> np.ndarray:
    for face in faces:
        x1, y1, x2, y2 = face.bbox
        crop = face.crop
        if crop is None or crop.size == 0:
            continue

        if recognition_service.is_ready():
            name, score = recognition_service.recognize_pure(model_service, crop)
        else:
            name, score = "DB not built", 0.0

        color = COLOR_UNKN if name in ("Unknown", "DB not built") else COLOR_BOX

        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

        label = name
        (tw, th), baseline = cv2.getTextSize(label, FONT, 0.65, 2)
        label_y = max(y1 - 10, th + 4)
        cv2.rectangle(frame,
                      (x1, label_y - th - 4),
                      (x1 + tw + 6, label_y + baseline),
                      color, cv2.FILLED)
        cv2.putText(frame, label, (x1 + 3, label_y),
                    FONT, 0.65, (0, 0, 0), 2, cv2.LINE_AA)
    return frame


def _overlay_hud(frame: np.ndarray, fps: float) -> np.ndarray:
    status = "LIVE | DB READY" if recognition_service.is_ready() else "LIVE | DB NOT BUILT"
    cv2.putText(frame, f"FPS: {fps:5.1f}", (10, 28),
                FONT, 0.7, COLOR_BOX, 2, cv2.LINE_AA)
    cv2.putText(frame, status, (10, 58),
                FONT, 0.55, COLOR_BOX, 1, cv2.LINE_AA)
    return frame



async def _mjpeg_generator():
    global _streaming
    _streaming = True
    min_interval = 1.0 / STREAM_FPS_LIMIT

    try:
        cam  = _get_camera()
        prev = time.time()

        while _streaming:
            ret, frame = cam.read()
            if not ret:
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(frame, "Camera error", (80, 240),
                            FONT, 1.2, (0, 0, 200), 2)
            else:
                if model_service.is_ready():
                    faces = model_service.detector.detect(frame, extract_crops=True)
                    frame = _draw_faces(frame, faces)

                now  = time.time()
                fps  = 1.0 / max(now - prev, 1e-6)
                prev = now
                frame = _overlay_hud(frame, fps)

            _, jpeg = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" +
                jpeg.tobytes() +
                b"\r\n"
            )

            elapsed = time.time() - prev
            await asyncio.sleep(max(0.0, min_interval - elapsed))

    except Exception as exc:
        print(f"[Stream] Error: {exc}")
    finally:
        _release_camera()



@router.get("/stream")
async def stream():
    """MJPEG live stream. Embed with <img src='.../realtime/stream' />"""
    if not model_service.is_ready():
        raise HTTPException(status_code=503, detail="Models not loaded yet.")
    return StreamingResponse(
        _mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma":        "no-cache",
            "Expires":       "0",
        }
    )


@router.post("/build-db")
async def build_db():
    """Build the in-memory recognition database from face_database/."""
    if not model_service.is_ready():
        raise HTTPException(status_code=503, detail="Models not loaded.")
    try:
        recognition_service.build_databases(model_service)
        return {"status": "success", "message": "Recognition database built successfully."}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/status")
async def status():
    """Return current system readiness."""
    return {
        "models_loaded": model_service.is_ready(),
        "db_ready":      recognition_service.is_ready(),
        "streaming":     _streaming,
    }


@router.post("/stop")
async def stop_stream():
    """Gracefully stop the camera stream."""
    _release_camera()
    return {"status": "success", "message": "Stream stopped."}
