from fastapi import APIRouter, HTTPException

from services.model_service    import model_service
from services.pipeline_service import pipeline_service
from services.validation_service import validation_service

router = APIRouter()



@router.get("/validate")
async def validate():
    """
    Compare face_database/ vs face_test/.
    Returns missing people WITHOUT running the pipeline.
    """
    result = validation_service.check()

    if not result.valid:
        return {
            "status":         "error",
            "message":        "Missing test data for some people in the database.",
            "missing_people": result.missing_people,
            "db_people":      result.db_people,
            "test_people":    result.test_people,
        }

    return {
        "status":         "ok",
        "message":        "All database people have test data. Ready to run pipeline.",
        "missing_people": [],
        "db_people":      result.db_people,
        "test_people":    result.test_people,
    }



@router.post("/run")
async def run_pipeline():
    """
    Start the full pipeline in a background thread.

    BLOCKS if:
      - Models not loaded
      - Pipeline already running
      - Validation fails (missing test data)

    Returns immediately with a 202 Accepted so the frontend
    can poll /pipeline/progress for updates.
    """
    if not model_service.is_ready():
        raise HTTPException(status_code=503, detail="Models not loaded yet.")

    if pipeline_service.is_running():
        raise HTTPException(status_code=409, detail="Pipeline is already running.")

    validation = validation_service.check()
    if not validation.valid:
        return {
            "status":         "error",
            "message":        "Missing test data",
            "missing_people": validation.missing_people,
        }

    try:
        pipeline_service.start(model_service)
    except RuntimeError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    return {
        "status":  "started",
        "message": "Pipeline started. Poll /pipeline/progress for updates.",
    }



@router.get("/progress")
async def get_progress():
    """
    Poll this endpoint while the pipeline runs.

    Response shape:
    {
      "stage":   "optimizing" | "benchmarking" | "done" | "error" | "idle",
      "percent": 0-100,
      "message": "...",
      "running": true | false,
      "error":   null | "error message"
    }
    """
    return pipeline_service.get_progress()



@router.get("/result")
async def get_result():
    """
    Fetch the result of the last completed pipeline run.

    Response shape:
    {
      "status": "success",
      "pure":   { accuracy, precision, recall, f1_score, fps },
      "hybrid": { accuracy, precision, recall, f1_score, fps },
      "optimized_params": { threshold, quality_scale, bilateral_d,
                            sigma_color, sigma_space, best_fitness },
      "confusion_matrix": [[...]],
      "class_labels":     [...]
    }
    """
    if pipeline_service.is_running():
        raise HTTPException(status_code=409, detail="Pipeline still running.")

    result = pipeline_service.get_result()
    if result is None:
        raise HTTPException(
            status_code=404,
            detail="No pipeline result available. Run the pipeline first."
        )

    if pipeline_service.progress.error:
        return {
            "status":  "error",
            "message": pipeline_service.progress.error,
        }

    return result
