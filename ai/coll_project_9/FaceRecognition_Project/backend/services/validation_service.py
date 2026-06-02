from pathlib import Path
from config import FACE_DB_PATH, FACE_TEST_PATH
from models.schemas import ValidationResult


class ValidationService:
    """
    Compares /face_database and /face_test directories.
    Every person present in the DB must have a corresponding
    folder in the test set before the pipeline is allowed to run.
    """

    def check(self) -> ValidationResult:
        db_people   = self._list_dirs(FACE_DB_PATH)
        test_people = self._list_dirs(FACE_TEST_PATH)

        missing = sorted(db_people - test_people)

        return ValidationResult(
            valid=len(missing) == 0,
            missing_people=missing,
            db_people=sorted(db_people),
            test_people=sorted(test_people),
        )


    @staticmethod
    def _list_dirs(path: Path) -> set[str]:
        if not path.exists():
            return set()
        return {entry.name for entry in path.iterdir() if entry.is_dir()}


validation_service = ValidationService()
