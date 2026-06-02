from pydantic import BaseModel
from typing import List, Optional, Dict, Any



class ValidationResult(BaseModel):
    valid: bool
    missing_people: List[str] = []
    db_people: List[str] = []
    test_people: List[str] = []


class ValidationErrorResponse(BaseModel):
    status: str = "error"
    message: str
    missing_people: List[str]



class MetricsResult(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    fps: float


class PipelineResult(BaseModel):
    status: str = "success"
    pure: MetricsResult
    hybrid: MetricsResult
    optimized_params: Dict[str, Any]
    confusion_matrix: List[List[int]]
    class_labels: List[str]



class PersonInfo(BaseModel):
    name: str
    image_count: int


class DatabaseStatus(BaseModel):
    people: List[PersonInfo]
    total: int


class AddPersonResponse(BaseModel):
    status: str
    name: str
    message: str



class DatasetStatus(BaseModel):
    people: List[PersonInfo]
    total: int
    missing_from_test: List[str]
    validation_ok: bool


class AddTestResponse(BaseModel):
    status: str
    name: str
    message: str



class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    detail: Optional[str] = None
