import shutil
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from config import FACE_DB_PATH
from services.model_service import model_service
from services.recognition_service import recognition_service
from utils.image_utils import validate_image_file, save_upload, list_people

router = APIRouter()



@router.post("/add-person")
async def add_person(
    name:  str        = Form(..., description="Person's name (used as folder name)"),
    image: UploadFile = File(..., description="Face image file"),
):
    """
    Upload a face image and save it under face_database/{name}/.
    Automatically rebuilds the in-memory recognition database.

    - Validates file type (jpg/png/bmp/webp only)
    - Sanitizes name (strips whitespace, rejects empty)
    - Creates person folder if it doesn't exist
    - Rebuilds embeddings after save
    """
    name = name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Person name cannot be empty.")
    if "/" in name or "\\" in name or ".." in name:
        raise HTTPException(status_code=400, detail="Invalid characters in name.")

    validate_image_file(image)

    person_dir = FACE_DB_PATH / name
    try:
        saved_path = await save_upload(image, person_dir)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {exc}")

    rebuild_msg = ""
    if model_service.is_ready():
        try:
            recognition_service.build_databases(model_service)
            rebuild_msg = " Recognition database rebuilt."
        except Exception as exc:
            rebuild_msg = f" Warning: DB rebuild failed: {exc}"

    return {
        "status":  "success",
        "name":    name,
        "message": f"Image saved to {saved_path.name}.{rebuild_msg}",
    }



@router.get("/list")
async def list_database():
    """Return all people currently in face_database/ with image counts."""
    people = list_people(FACE_DB_PATH)
    return {
        "status": "ok",
        "people": people,
        "total":  len(people),
    }



@router.get("/person/{name}")
async def get_person(name: str):
    """Return info for a specific person in the database."""
    person_dir = FACE_DB_PATH / name
    if not person_dir.exists() or not person_dir.is_dir():
        raise HTTPException(status_code=404, detail=f"Person '{name}' not found in database.")

    from config import ALLOWED_IMAGE_EXTENSIONS
    images = [f.name for f in person_dir.iterdir()
              if f.suffix.lower() in ALLOWED_IMAGE_EXTENSIONS]

    return {
        "name":        name,
        "image_count": len(images),
        "images":      images,
    }



@router.delete("/person/{name}")
async def delete_person(name: str):
    """
    Remove a person and all their images from face_database/.
    Rebuilds the in-memory recognition database automatically.
    """
    name = name.strip()
    person_dir = FACE_DB_PATH / name
    if not person_dir.exists() or not person_dir.is_dir():
        raise HTTPException(status_code=404, detail=f"Person '{name}' not found.")

    try:
        shutil.rmtree(person_dir)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to delete person: {exc}")

    rebuild_msg = ""
    if model_service.is_ready():
        try:
            recognition_service.build_databases(model_service)
            rebuild_msg = " Recognition database rebuilt."
        except Exception as exc:
            rebuild_msg = f" Warning: DB rebuild failed: {exc}"

    return {
        "status":  "success",
        "name":    name,
        "message": f"Person '{name}' deleted.{rebuild_msg}",
    }
