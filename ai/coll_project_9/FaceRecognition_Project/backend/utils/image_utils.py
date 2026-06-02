import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException

from config import ALLOWED_IMAGE_EXTENSIONS


def validate_image_file(file: UploadFile) -> None:
    """Raise HTTP 400 if the uploaded file is not an allowed image type."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )


async def save_upload(file: UploadFile, destination_dir: Path, filename: str | None = None) -> Path:
    """
    Save an uploaded file to destination_dir.
    If filename is None a UUID-based name is generated.
    Returns the final file path.
    """
    destination_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix.lower()
    final_name = filename if filename else f"{uuid.uuid4().hex}{ext}"
    dest_path = destination_dir / final_name

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    with open(dest_path, "wb") as f:
        f.write(contents)

    return dest_path


def list_people(base_path: Path) -> list[dict]:
    """Return [{name, image_count}] for every sub-directory in base_path."""
    if not base_path.exists():
        return []
    result = []
    for entry in sorted(base_path.iterdir()):
        if entry.is_dir():
            imgs = [
                f for f in entry.iterdir()
                if f.suffix.lower() in ALLOWED_IMAGE_EXTENSIONS
            ]
            result.append({"name": entry.name, "image_count": len(imgs)})
    return result


def ensure_dirs(*paths: Path) -> None:
    """Create directories if they do not exist."""
    for p in paths:
        p.mkdir(parents=True, exist_ok=True)
