#!/usr/bin/env python
"""
AI Worker Diagnostic Script
Checks if all imports and dependencies are working correctly.
Run this before starting the AI Worker to diagnose issues.
"""

import sys
import os
from pathlib import Path
import traceback

print("\n" + "=" * 70)
print("🔍 AI Worker Diagnostics")
print("=" * 70 + "\n")

# Test 1: Python version
print("📌 Test 1: Python Version")
print(f"   Python: {sys.version}")
print(f"   Executable: {sys.executable}")
print()

# Test 2: Check paths
print("📌 Test 2: Project Paths")
ai_worker_dir = Path(__file__).parent.resolve()
print(f"   AI Worker: {ai_worker_dir}")

face_recognition_paths = [
    ai_worker_dir.parent.parent / "ai" / "coll_project_9" / "FaceRecognition_Project",
    ai_worker_dir.parent / "coll_project_9" / "FaceRecognition_Project",
]

found_path = None
for i, path in enumerate(face_recognition_paths, 1):
    exists = path.exists()
    backend_exists = (path / "backend").exists() if exists else False
    status = "✅" if backend_exists else "❌"
    print(f"   [{status}] Path {i}: {path}")
    print(f"          exists: {exists}, backend: {backend_exists}")
    if backend_exists:
        found_path = path

if not found_path:
    print("\n   ❌ CRITICAL: FaceRecognition_Project not found!")
    sys.exit(1)

print(f"\n   ✅ Using: {found_path}\n")

# Test 3: Check required files
print("📌 Test 3: Required Files")
required_files = [
    (found_path / "best.pt", "YOLO weights"),
    (found_path / "face_database", "Face database directory"),
    (found_path / "backend" / "services" / "model_service.py", "Model service"),
    (found_path / "backend" / "services" / "recognition_service.py", "Recognition service"),
]

all_files_ok = True
for file_path, description in required_files:
    exists = file_path.exists()
    status = "✅" if exists else "❌"
    print(f"   [{status}] {description}: {file_path}")
    if not exists and "database" not in description:  # DB not required to exist
        all_files_ok = False

print()

# Test 4: Check Python dependencies
print("📌 Test 4: Python Dependencies")
required_packages = [
    "fastapi",
    "uvicorn",
    "pydantic",
    "cv2",
    "numpy",
    "PIL",
    "torch",
    "insightface",
    "onnx",
]

missing_packages = []
for package in required_packages:
    try:
        __import__(package)
        print(f"   ✅ {package}")
    except ImportError:
        print(f"   ❌ {package}")
        missing_packages.append(package)

if missing_packages:
    print(f"\n   ⚠️  Missing packages: {', '.join(missing_packages)}")
    print(f"   Run: pip install -r {found_path}/requirements.txt")

print()

# Test 5: Try importing AI services
print("📌 Test 5: AI Service Imports")
sys.path.insert(0, str(found_path))
sys.path.insert(0, str(found_path / "backend"))

try:
    from services.model_service import ModelService
    print("   ✅ ModelService imported")
except Exception as e:
    print(f"   ❌ ModelService import failed: {e}")
    traceback.print_exc()

try:
    from services.recognition_service import RecognitionService
    print("   ✅ RecognitionService imported")
except Exception as e:
    print(f"   ❌ RecognitionService import failed: {e}")
    traceback.print_exc()

print()

# Test 6: Environment
print("📌 Test 6: Environment Variables")
env_vars = {
    "PROJECT_BASE_DIR": str(found_path),
    "YOLO_CONF": "0.55",
    "COSINE_THRESHOLD": "0.5",
    "INSIGHTFACE_MODEL": "buffalo_l",
}

for var, default in env_vars.items():
    value = os.getenv(var, default)
    source = "set" if var in os.environ else "default"
    print(f"   {var}: {value} ({source})")

print()

# Summary
print("=" * 70)
if not missing_packages and found_path:
    print("✅ All systems operational! You can start the AI Worker.")
    print("\n   Command: python app.py")
else:
    print("❌ Some issues detected. Fix them before starting AI Worker.")
    print("\n   See TROUBLESHOOTING.md for help.")

print("=" * 70 + "\n")
