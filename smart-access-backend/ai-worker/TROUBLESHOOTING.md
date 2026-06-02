# AI Worker Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: "AI system not available - using fallback mode"

**Symptoms:**
```
WARNING:__main__:⚠️ AI system not available - using fallback mode
```

**Root Causes & Solutions:**

#### A. Missing Dependencies
The face recognition system requires Python packages. Install them:

```bash
cd d:\gp ai\ai\coll_project_9\FaceRecognition_Project
pip install -r requirements.txt
```

#### B. Missing YOLO Weights File
The `best.pt` file (YOLO model weights) is not found.

**Check:**
```bash
# Should exist:
d:\gp ai\ai\coll_project_9\FaceRecognition_Project\best.pt
```

**Fix:** Download the file from your training output and place it in the FaceRecognition_Project root.

#### C. Project Path Not Found
The AI Worker can't locate the FaceRecognition_Project directory.

**Expected locations:**
- `../../ai/coll_project_9/FaceRecognition_Project` ← Primary (relative to ai-worker/app.py)
- `../coll_project_9/FaceRecognition_Project` ← Secondary (if moved)

**Check logs:** The startup will show which paths it searched.

#### D. Import Errors
Python can't import the face recognition modules.

**Check with debug script:**
```python
import sys
from pathlib import Path

# Add the path
project_path = Path("d:/gp ai/ai/coll_project_9/FaceRecognition_Project")
sys.path.insert(0, str(project_path))
sys.path.insert(0, str(project_path / "backend"))

# Try importing
try:
    from services.model_service import ModelService
    print("✅ Import successful!")
except ImportError as e:
    print(f"❌ Import failed: {e}")
```

---

### Issue 2: "404 Not Found" on POST /api/auth/login

**Symptoms:**
```
127.0.0.1:59653 - "POST /api/auth/login HTTP/1.1" 404 Not Found
```

**Root Cause:** 
The client is sending authentication requests to the **AI Worker (port 5000)** instead of the **Node.js Backend (port 3000)**.

**AI Worker (port 5000) Endpoints:**
- `GET /health` - Health check
- `POST /recognize` - Face recognition
- `POST /embedding` - Extract face embedding
- `POST /add-person` - Add person to database
- `GET /db-status` - Database status
- `POST /rebuild-db` - Rebuild database

**Node.js Backend (port 3000) Endpoints:**
- `POST /api/auth/login` - User authentication ✅
- `POST /api/auth/register` - User registration ✅
- Other API routes

**Solution:**
Ensure your client is using the correct URLs:
- **Auth requests** → `http://localhost:3000/api/auth/login`
- **AI requests** → `http://localhost:5000/recognize`

---

### Issue 3: Face Detection Not Working (even with "System Available")

**Symptoms:**
- Health check shows `ai_available: true`
- But `/recognize` returns "No face detected" for valid images

**Solutions:**

1. **Check YOLO Model Quality:**
   - Ensure `best.pt` is a properly trained YOLO model
   - Try test images that clearly show faces

2. **Adjust Detection Threshold:**
   ```bash
   # In ai-worker/config.py
   YOLO_CONF_THRESHOLD = 0.55  # Lower value = more detections (but more false positives)
   ```

3. **Check Face Database:**
   ```bash
   curl http://localhost:5000/db-status
   ```
   Should return list of people in database.

4. **Check Image Format:**
   - Must be valid JPEG, PNG, BMP, or WebP
   - Base64 encoded with optional data URI prefix

---

### Issue 4: Database Not Building

**Symptoms:**
- `/db-status` returns `"ready": false`
- `/recognize` fails with database errors

**Solutions:**

1. **Rebuild the database:**
   ```bash
   curl -X POST http://localhost:5000/rebuild-db
   ```

2. **Check face database path:**
   ```bash
   curl http://localhost:5000/db-status
   ```
   Look for `path` field.

3. **Verify images in database:**
   - Each person should have a folder: `face_database/person-id/`
   - Each folder should contain JPEG/PNG images of faces

---

## Debug Commands

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Database Status
```bash
curl http://localhost:5000/db-status
```

### 3. Rebuild Database
```bash
curl -X POST http://localhost:5000/rebuild-db
```

### 4. Test Recognition (requires base64-encoded image)
```bash
curl -X POST http://localhost:5000/recognize \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."}'
```

---

## Environment Variables

Set these in `.env` file in `smart-access-backend/`:

```bash
# AI Worker
BACKEND_URL=http://localhost:3000
AI_URL=http://localhost:5000
PORT=5000

# Face Recognition
PROJECT_BASE_DIR=d:\gp ai\ai\coll_project_9\FaceRecognition_Project
FACE_DB_DIR=face_database
YOLO_WEIGHTS=best.pt
YOLO_CONF=0.55
COSINE_THRESHOLD=0.5

# InsightFace
INSIGHTFACE_MODEL=buffalo_l
```

---

## Log Locations

AI Worker logs are printed to console. To capture them:

```bash
# Windows PowerShell
python app.py | Tee-Object -FilePath logs.txt

# Windows Command Prompt
python app.py > logs.txt 2>&1
```

---

## Getting Help

If issues persist:

1. **Check full startup logs** - Look for detailed error messages in startup sequence
2. **Verify all dependencies** - Run `pip list` to confirm packages are installed
3. **Test in isolation** - Try importing face recognition directly in Python
4. **Check configuration** - Verify `config.py` paths are correct
5. **Review firewall** - Ensure ports 3000 and 5000 are not blocked
