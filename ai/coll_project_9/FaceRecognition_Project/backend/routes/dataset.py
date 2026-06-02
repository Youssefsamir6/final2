import shutil
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from config import FACE_TEST_PATH, FACE_DB_PATH
from services.validation_service import validation_service
from utils.image_utils import validate_image_file, save_upload, list_people
from config import ALLOWED_IMAGE_EXTENSIONS

router = APIRouter()



@router.post("/add-test")
async def add_test(
    name:  str        = Form(..., description="Person's name (must match database name)"),
    image: UploadFile = File(..., description="Test face image"),
):
    """
    Upload a test image and save it to face_test/{name}/.

    - name should match the folder name used in face_database/
    - Creates the folder automatically if it doesn't exist
    - Validates file type
    """
    name = name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Person name cannot be empty.")
    if "/" in name or "\\" in name or ".." in name:
        raise HTTPException(status_code=400, detail="Invalid characters in name.")

    validate_image_file(image)

    person_dir = FACE_TEST_PATH / name
    try:
        saved_path = await save_upload(image, person_dir)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save test image: {exc}")

    db_dir = FACE_DB_PATH / name
    in_db  = db_dir.exists() and db_dir.is_dir()

    return {
        "status":    "success",
        "name":      name,
        "in_db":     in_db,
        "message":   f"Test image saved as {saved_path.name}."
                     + ("" if in_db else f" Note: '{name}' not found in face_database yet."),
    }



@router.get("/list")
async def list_dataset():
    """Return all people in face_test/ with image counts."""
    people = list_people(FACE_TEST_PATH)
    return {
        "status": "ok",
        "people": people,
        "total":  len(people),
    }



@router.get("/status")
async def dataset_status():
    """
    Returns:
      - All people in face_test/
      - All people in face_database/
      - Which DB people are MISSING from face_test/ (blocks pipeline)
      - Overall validation_ok flag

    This is the data the Dataset page uses to highlight missing entries in red.
    """
    validation = validation_service.check()

    test_people = list_people(FACE_TEST_PATH)
    db_people   = list_people(FACE_DB_PATH)

    annotated_test = []
    db_names = {p["name"] for p in db_people}
    for person in test_people:
        annotated_test.append({
            **person,
            "in_db": person["name"] in db_names,
        })

    return {
        "status":           "ok",
        "test_people":      annotated_test,
        "db_people":        db_people,
        "missing_from_test": validation.missing_people,
        "validation_ok":    validation.valid,
        "total_test":       len(test_people),
        "total_db":         len(db_people),
    }



@router.delete("/person/{name}")
async def delete_test_person(name: str):
    """Remove a person's test folder from face_test/."""
    name = name.strip()
    person_dir = FACE_TEST_PATH / name
    if not person_dir.exists() or not person_dir.is_dir():
        raise HTTPException(
            status_code=404,
            detail=f"Person '{name}' not found in test dataset."
        )
    try:
        shutil.rmtree(person_dir)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to delete: {exc}")

    return {
        "status":  "success",
        "name":    name,
        "message": f"Test data for '{name}' deleted.",
    }
