from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import cv2
import numpy as np
import os
from PIL import Image
import io
import sys
from pathlib import Path
from typing import Optional, List
import logging
import uvicorn

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add parent directory to path to import face recognition modules
# Try multiple possible paths
base_paths = [
    Path(__file__).parent.parent.parent / "ai" / "coll_project_9" / "FaceRecognition_Project",
    Path(__file__).parent.parent / "coll_project_9" / "FaceRecognition_Project",
]

face_recognition_path = None
for path in base_paths:
    if path.exists() and (path / "backend").exists():
        face_recognition_path = path
        logger.info(f"✅ Found FaceRecognition_Project at: {path}")
        break

if not face_recognition_path:
    logger.warning(f"❌ Could not find FaceRecognition_Project in: {[str(p) for p in base_paths]}")
    logger.warning("Available base paths searched:")
    for p in base_paths:
        logger.warning(f"  - {p} (exists: {p.exists()})")

# Initialize AI system
import threading
model_service = None
recognition_service = None
AI_AVAILABLE = False

# Rebuild coordination (must never block request handler)
_rebuild_event = threading.Event()

if face_recognition_path:
    try:
        # Add both the project root and backend to path
        project_root = str(face_recognition_path)
        backend_path = str(face_recognition_path / "backend")
        
        sys.path.insert(0, project_root)
        sys.path.insert(0, backend_path)
        
        logger.info(f"Added to sys.path: {project_root}")
        logger.info(f"Added to sys.path: {backend_path}")
        
        # Import with proper error handling
        from services.model_service import ModelService
        from services.recognition_service import RecognitionService
        
        # Create singleton instances
        model_service = ModelService()
        recognition_service = RecognitionService()
        
        logger.info("✅ Successfully imported AI services")
        AI_AVAILABLE = True
        
    except ImportError as e:
        logger.error(f"❌ Failed to import AI services: {e}")
        logger.error(f"   sys.path entries: {sys.path[:3]}")
        import traceback
        logger.error(f"   Traceback: {traceback.format_exc()}")
        model_service = None
        recognition_service = None
        AI_AVAILABLE = False
    except Exception as e:
        logger.error(f"❌ Unexpected error initializing AI: {e}")
        import traceback
        logger.error(f"   Traceback: {traceback.format_exc()}")
        AI_AVAILABLE = False

# Import our standalone config (local to ai-worker)
try:
    from config import FACE_DB_PATH, COSINE_THRESHOLD
except ImportError as e:
    logger.warning(f"Could not import local config: {e}")
    from pathlib import Path
    # Use the same detection logic to find correct path
    if face_recognition_path:
        FACE_DB_PATH = face_recognition_path / "face_database"
    else:
        FACE_DB_PATH = Path(__file__).parent.parent.parent / "ai" / "coll_project_9" / "FaceRecognition_Project" / "face_database"
    COSINE_THRESHOLD = 0.5
    logger.info(f"Using fallback FACE_DB_PATH: {FACE_DB_PATH}")

app = FastAPI(
    title="Smart Access AI Worker",
    version="1.0.0",
    description="AI integration bridge for face recognition"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class RecognizeRequest(BaseModel):
    image: str
    embedding_dim: Optional[int] = 128

class EmbeddingRequest(BaseModel):
    image: str

class RecognitionResponse(BaseModel):
    userId: Optional[str] = None
    confidence: float
    embedding: Optional[List[float]] = None
    reason: str = ""

# Lifespan for startup/shutdown
@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    logger.info("=" * 60)
    logger.info("🚀 AI Worker Startup Sequence")
    logger.info("=" * 60)
    
    logger.info(f"AI_AVAILABLE: {AI_AVAILABLE}")
    logger.info(f"model_service: {model_service}")
    logger.info(f"recognition_service: {recognition_service}")
    
    if not AI_AVAILABLE:
        logger.warning("⚠️  AI system not available - using fallback mode")
        logger.warning("   This is expected if FaceRecognition_Project dependencies are not installed")
        logger.warning("   The API will still respond but with degraded recognition capability")
        return
    
    if model_service is None or recognition_service is None:
        logger.warning("⚠️  AI services are None despite AI_AVAILABLE=True - using fallback mode")
        return
    
    try:
        logger.info("📦 Initializing AI models (this may take 30-60 seconds)...")
        model_service.initialize()
        logger.info("✅ AI models initialized successfully")
        
        logger.info("🗄️  Building recognition databases...")
        recognition_service.build_databases(model_service)
        logger.info("✅ Recognition databases built successfully")
        
        logger.info("=" * 60)
        logger.info("✅ AI Worker fully operational!")
        logger.info("=" * 60)
    except FileNotFoundError as e:
        logger.error(f"❌ File not found during initialization: {e}")
        logger.error("   Check that best.pt (YOLO weights) exists in the project directory")
        logger.warning("⚠️  Running in degraded mode - fallback recognition available")
    except ImportError as e:
        logger.error(f"❌ Import error during initialization: {e}")
        logger.error("   Missing dependencies. Run: pip install -r requirements.txt")
        logger.warning("⚠️  Running in degraded mode - fallback recognition available")
    except Exception as e:
        logger.error(f"❌ Failed to initialize AI models: {e}")
        import traceback
        logger.error(f"   Traceback: {traceback.format_exc()}")
        logger.warning("⚠️  Running in degraded mode - fallback recognition available")

@app.get("/health")
async def health():
    """Health check endpoint"""
    models_ready = False
    if AI_AVAILABLE and model_service:
        try:
            models_ready = model_service.is_ready()
        except:
            models_ready = False
    
    return {
        "status": "ok",
        "ai_available": AI_AVAILABLE,
        "models_ready": models_ready,
        "version": "1.0.0"
    }

def decode_base64_image(image_b64: str):
    """Decode base64 image to OpenCV format"""
    try:
        # Remove data URI prefix if present
        if ',' in image_b64:
            image_b64 = image_b64.split(',')[1]
        
        image_data = base64.b64decode(image_b64)
        pil_image = Image.open(io.BytesIO(image_data))
        opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        return opencv_image
    except Exception as e:
        raise ValueError(f"Failed to decode image: {e}")

def detect_faces(image):
    """Detect faces in image using YOLO"""
    if not AI_AVAILABLE or not model_service or not hasattr(model_service, 'detector'):
        raise RuntimeError("Face detector not available")
    
    try:
        detections = model_service.detector(image)
        return detections
    except Exception as e:
        logger.error(f"Face detection error: {e}")
        raise

def recognize_face_hybrid(image):
    """Recognize faces using hybrid recognition"""
    if not AI_AVAILABLE or not model_service or not recognition_service:
        raise RuntimeError("Recognition service not available")
    
    try:
        # Detect faces first
        detections = detect_faces(image)
        if not detections:
            return None, None, 0.0
        
        # Get the best recognition result
        best_match = None
        best_conf = 0.0
        
        for face in detections:
            if face.crop is None:
                continue
            
            # Try hybrid recognition
            name, score = recognition_service.recognize_pure(model_service, face.crop)
            if score and score > best_conf:
                best_conf = score
                best_match = name
        
        return best_match, None, best_conf
    except Exception as e:
        logger.error(f"Recognition error: {e}")
        raise

@app.post("/recognize", response_model=RecognitionResponse)
async def recognize(request: RecognizeRequest):
    """
    Recognize face from base64 image.
    Compatible with Node.js backend AI service calls.
    """
    try:
        # Decode image
        try:
            image = decode_base64_image(request.image)
        except ValueError as e:
            logger.warning(f"Invalid image data: {e}")
            return RecognitionResponse(
                userId=None,
                confidence=0.0,
                reason="Invalid image format"
            )
        
        models_ready = False
        if AI_AVAILABLE and model_service:
            try:
                models_ready = model_service.is_ready()
            except:
                models_ready = False
        
        if not models_ready:
            logger.info("Running in fallback mode (AI not ready)")
            return RecognitionResponse(
                userId=None,
                confidence=0.0,
                reason="AI models not initialized (fallback mode)"
            )
        
        # Recognize faces
        user_id, embedding, confidence = recognize_face_hybrid(image)
        
        # Map user_id to userId for compatibility
        result = RecognitionResponse(
            userId=user_id,
            confidence=min(confidence, 1.0) if confidence else 0.0,
            embedding=embedding,
            reason=f"Recognition confidence: {confidence:.2f}" if confidence else "No face detected"
        )
        
        logger.info(f"Recognition result: userId={result.userId}, confidence={result.confidence}")
        return result
    
    except Exception as e:
        logger.error(f"Recognition error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embedding")
async def extract_embedding(request: EmbeddingRequest):
    """
    Extract face embedding from base64 image.
    Compatible with Node.js backend for face enrollment.
    """
    try:
        # Decode image
        try:
            image = decode_base64_image(request.image)
        except ValueError as e:
            logger.warning(f"Invalid image data: {e}")
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        models_ready = False
        if AI_AVAILABLE and model_service:
            try:
                models_ready = model_service.is_ready() if hasattr(model_service, 'is_ready') else False
            except:
                models_ready = False
        
        if not models_ready:
            raise HTTPException(status_code=503, detail="AI models not initialized (fallback mode)")
        
        # Detect and extract embedding
        detections = detect_faces(image)
        if not detections:
            raise HTTPException(status_code=400, detail="No face detected")
        
        # Get best face
        best_face = detections[0]
        if best_face.crop is None:
            raise HTTPException(status_code=400, detail="Could not extract face")
        
        # Extract embedding using recognizer
        embedding = model_service.recognizer.get_embedding(best_face.crop)
        
        return {
            "embedding": embedding.tolist() if hasattr(embedding, 'tolist') else embedding,
            "reason": "Embedding extracted successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Embedding extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/add-person")
async def add_person(
    user_id: str = Form(..., description="User ID"),
    image: UploadFile = File(..., description="Face image")
):
    """
    Add a person's face to the database.
    Creates folder structure and rebuilds recognition database.
    """
    if not AI_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI system not available")
    
    try:
        # Create user folder
        user_folder = FACE_DB_PATH / user_id
        user_folder.mkdir(parents=True, exist_ok=True)
        
        # Save image
        contents = await image.read()
        filename = f"{user_id}_{image.filename}"
        filepath = user_folder / filename
        
        with open(filepath, 'wb') as f:
            f.write(contents)
        
        # Rebuild recognition database
        if model_service.is_ready():
            recognition_service.build_databases(model_service)
        
        return {
            "success": True,
            "message": f"Person {user_id} added successfully",
            "folder": str(user_folder)
        }
    
    except Exception as e:
        logger.error(f"Add person error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/db-status")
async def db_status():
    """Get face database status"""
    if not AI_AVAILABLE:
        return {
            "status": "unavailable",
            "people": 0,
            "ready": False
        }
    
    try:
        # Count folders in face database
        people = list(FACE_DB_PATH.glob("*/"))
        
        return {
            "status": "ok",
            "people": len(people),
            "ready": recognition_service.is_ready(),
            "path": str(FACE_DB_PATH),
            "people_list": [p.name for p in people]
        }
    except Exception as e:
        logger.error(f"DB status error: {e}")
        return {
            "status": "error",
            "error": str(e),
            "people": 0,
            "ready": False
        }

@app.post("/rebuild-db")
async def rebuild_db():
    """Rebuild the recognition database.

    For demo/testing we must respond quickly; rebuilding is triggered in a background thread.
    """
    if not AI_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI system not available")

    # Always respond immediately.
    try:
        logger.info("Rebuild requested: triggering background job...")
        import threading

        def _rebuild_job_sync():
            try:
                # Build may take time
                recognition_service.build_databases(model_service)
                logger.info("Database rebuilt successfully")
            except Exception as e:
                logger.error(f"Rebuild job failed: {e}")

        threading.Thread(target=_rebuild_job_sync, daemon=True).start()

    except Exception as e:
        # Even if scheduling fails, don't hang the endpoint.
        logger.error(f"Failed to schedule rebuild job: {e}")

    return {
        "success": True,
        "queued": True,
        "message": "Rebuild triggered; check /db-status later"
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting AI Worker on port {port}...")
    uvicorn.run(app, host='0.0.0.0', port=port, log_level="info")

