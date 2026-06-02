# 🚀 Quick Start - AI Worker

Get the AI system running in 5 minutes.

## Step 1: Install Dependencies (2 min)

```bash
cd d:\gp ai\smart-access-backend\ai-worker

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed fastapi uvicorn pydantic cv2 torch ...
```

## Step 2: Run Diagnostics (1 min)

```bash
python diagnose.py
```

**Expected output:**
```
✅ Test 1: Python Version
   Python: 3.x.x
   
✅ Test 2: Project Paths
   [✅] Path 1: d:\gp ai\ai\coll_project_9\FaceRecognition_Project
   
✅ Test 3: Required Files
   [✅] YOLO weights: ...best.pt
   [✅] Face database directory: ...face_database
   [✅] Model service: ...model_service.py
   
✅ Test 4: Python Dependencies
   ✅ fastapi
   ✅ uvicorn
   ...
   
✅ All systems operational!
```

**If you see ❌:**
- Read the error message
- Run: `pip install -r requirements.txt` in FaceRecognition_Project
- Re-run `python diagnose.py`

## Step 3: Start AI Worker (1 min)

```bash
python app.py
```

**Expected output:**
```
INFO:__main__:============================================================
INFO:__main__:🚀 AI Worker Startup Sequence
INFO:__main__:============================================================
INFO:__main__:✅ Found FaceRecognition_Project at: d:\gp ai\ai\coll_project_9\...
INFO:__main__:✅ Successfully imported AI services
INFO:__main__:📦 Initializing AI models (this may take 30-60 seconds)...
INFO:__main__:✅ AI models initialized successfully
INFO:__main__:✅ Recognition databases built successfully
INFO:__main__:✅ AI Worker fully operational!
INFO:__main__:============================================================
INFO:     Uvicorn running on http://0.0.0.0:5000
```

## Step 4: Verify It Works (1 min)

In another terminal:
```bash
cd d:\gp ai\smart-access-backend\ai-worker
python test_endpoints.py
```

**Expected output:**
```
============================================================
  Testing AI Worker (Port 5000)
============================================================

1️⃣  Health Check
   Status: 200
   ✅ AI Worker is responding

2️⃣  Database Status
   People in database: 5
   Database ready: True
   ✅ Database check successful

✅ AI Worker is ready!
```

## Step 5: Start Backend (Optional but Recommended)

In another terminal:
```bash
cd d:\gp ai\smart-access-backend
npm install  # If not already installed
node server.js
```

---

## What's Running?

Now you have:

| Service | Port | Command | Status |
|---------|------|---------|--------|
| **AI Worker** | 5000 | `python app.py` | 🟢 Running |
| **Backend** | 3000 | `node server.js` | 🟢 Running (optional) |

---

## Key Points

### ✅ Authentication (Port 3000)
```bash
curl http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'
```

### ✅ Face Recognition (Port 5000)
```bash
curl http://localhost:5000/recognize \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,..."}'
```

### ✅ Health Check (Port 5000)
```bash
curl http://localhost:5000/health
```

---

## Troubleshooting

### ❌ "ModuleNotFoundError: No module named..."
```bash
pip install -r requirements.txt
```

### ❌ "Could not find FaceRecognition_Project"
- Check path exists: `d:\gp ai\ai\coll_project_9\FaceRecognition_Project`
- Run: `python diagnose.py` to verify

### ❌ "Best.pt not found"
- Ensure YOLO weights file exists:
  ```bash
  d:\gp ai\ai\coll_project_9\FaceRecognition_Project\best.pt
  ```
- Download from training output if missing

### ❌ AI Worker responding but "AI system not available"
- This is normal on first run (models loading)
- Or dependencies not fully installed
- Run: `python diagnose.py`

---

## Next Steps

1. ✅ AI Worker running on port 5000
2. ✅ Backend running on port 3000
3. 📖 Read: [README_AI_WORKER.md](README_AI_WORKER.md)
4. 🔍 See: [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if issues
5. 🧪 Review: [DEBUG_REPORT.md](DEBUG_REPORT.md) for full explanation

---

## Files Reference

| File | Purpose |
|------|---------|
| `app.py` | Main AI Worker app |
| `config.py` | Configuration |
| `diagnose.py` | System check |
| `test_endpoints.py` | Endpoint test |
| `requirements.txt` | Python packages |
| `README_AI_WORKER.md` | Complete guide |
| `TROUBLESHOOTING.md` | Help & solutions |
| `DEBUG_REPORT.md` | Issue explanation |
| `QUICK_START.md` | This file |

---

**🎉 Done! Your AI Worker is ready to recognize faces.**
