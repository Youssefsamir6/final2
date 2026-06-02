# AI Worker - FastAPI Face Recognition Service

The AI Worker is a separate Python/FastAPI service that handles all face recognition operations for the Smart Access system.

## Key Points

### ⚠️ Important: Separate Service
- **AI Worker runs on port 5000** (Python/FastAPI)
- **Main backend runs on port 3000** (Node.js/Express)
- These are **two different servers** handling different concerns

### Port Assignment
| Service | Port | Language | Purpose |
|---------|------|----------|---------|
| AI Worker | 5000 | Python/FastAPI | Face recognition, embeddings |
| Backend | 3000 | Node.js/Express | Auth, API, database, business logic |

---

## Quick Start

### 1. Install Dependencies
```bash
cd ai-worker

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows

# Install requirements
pip install -r requirements.txt
```

### 2. Run Diagnostics
```bash
python diagnose.py
```

This checks:
- Python version
- Project paths
- Required files (YOLO weights, etc.)
- Dependencies
- Imports

### 3. Start AI Worker
```bash
python app.py
```

Expected output:
```
INFO:__main__:============================================================
INFO:__main__:🚀 AI Worker Startup Sequence
INFO:__main__:============================================================
INFO:__main__:📦 Initializing AI models (this may take 30-60 seconds)...
INFO:__main__:✅ AI models initialized successfully
INFO:__main__:🗄️  Building recognition databases...
INFO:__main__:✅ Recognition databases built successfully
INFO:__main__:✅ AI Worker fully operational!
```

---

## API Endpoints

### Health Check
```bash
GET /health
```
Response:
```json
{
  "status": "ok",
  "ai_available": true,
  "models_ready": true,
  "version": "1.0.0"
}
```

### Recognize Face
```bash
POST /recognize
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

Response:
```json
{
  "userId": "person-123",
  "confidence": 0.95,
  "embedding": [0.1, 0.2, ...],
  "reason": "Recognition confidence: 0.95"
}
```

### Extract Embedding
```bash
POST /embedding
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

Response:
```json
{
  "embedding": [0.1, 0.2, ...],
  "reason": "Embedding extracted successfully"
}
```

### Add Person
```bash
POST /add-person
Content-Type: multipart/form-data

user_id: person-123
image: <binary image file>
```

### Database Status
```bash
GET /db-status
```

### Rebuild Database
```bash
POST /rebuild-db
```

---

## Common Issues

### ❌ "AI system not available - using fallback mode"

This warning appears during startup if the face recognition system couldn't initialize.

**Causes:**
1. Missing YOLO weights file (`best.pt`)
2. Missing Python dependencies
3. Can't find FaceRecognition_Project directory
4. Import errors

**Solution:**
```bash
# Run diagnostics
python diagnose.py

# Install dependencies
pip install -r requirements.txt
```

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

### ❌ "404 Not Found" on POST /api/auth/login

**This is NOT an AI Worker issue!**

You're sending auth requests to the wrong server:
- ❌ `http://localhost:5000/api/auth/login` (AI Worker - doesn't have auth)
- ✅ `http://localhost:3000/api/auth/login` (Backend - has auth)

**AI Worker only handles:**
- Face recognition
- Face embeddings
- Database management

**Backend (port 3000) handles:**
- Authentication
- User management
- Access control
- All other APIs

---

## Configuration

### Environment Variables (in `.env`)

```bash
# AI Worker Server
PORT=5000
BACKEND_URL=http://localhost:3000

# Face Recognition
PROJECT_BASE_DIR=d:\gp ai\ai\coll_project_9\FaceRecognition_Project
FACE_DB_DIR=face_database
YOLO_WEIGHTS=best.pt

# Model Parameters
YOLO_CONF=0.55              # YOLO confidence threshold (lower = more detections)
COSINE_THRESHOLD=0.5        # Face similarity threshold
QUALITY_SCALE=500.0         # Quality scaling factor
INSIGHTFACE_MODEL=buffalo_l # InsightFace model

# Performance
STREAM_FPS=30               # Camera streaming FPS limit
```

---

## Architecture

```
Smart Access System
│
├── Backend (Node.js, port 3000)
│   ├── Auth (/api/auth/*)
│   ├── Users (/api/users/*)
│   ├── Access Control (/api/access/*)
│   └── Calls AI Worker when needed
│
└── AI Worker (FastAPI, port 5000)
    ├── Face Recognition (/recognize)
    ├── Embeddings (/embedding)
    ├── Database Management (/db-status, /rebuild-db)
    └── Health Check (/health)
```

### Data Flow Example: Face Verification
```
Client Request
  ↓
Backend (3000) - Auth, validation
  ↓
AI Worker (5000) - Face recognition
  ↓
Backend (3000) - Process result, update database
  ↓
Response to Client
```

---

## Fallback Mode

If AI models fail to initialize, the system runs in **fallback mode**:
- ✅ API endpoints still available
- ❌ Face recognition returns `confidence: 0.0`
- ❌ Face embeddings not available

**This is normal during:**
- First startup (models loading)
- Missing YOLO weights
- Missing Python packages

The system will automatically use full recognition once dependencies are installed.

---

## Files

| File | Purpose |
|------|---------|
| `app.py` | Main FastAPI application |
| `config.py` | Configuration and paths |
| `camera_worker.py` | Optional: Camera streaming integration |
| `requirements.txt` | Python dependencies |
| `diagnose.py` | Diagnostic tool |
| `TROUBLESHOOTING.md` | Troubleshooting guide |

---

## Debugging

### View Detailed Logs
```bash
python app.py 2>&1 | Tee-Object logs.txt  # PowerShell
python app.py > logs.txt 2>&1              # Command Prompt
```

### Check System Status
```bash
curl http://localhost:5000/health
curl http://localhost:5000/db-status
```

### Debug Path Issues
```bash
python diagnose.py
```

### Monitor in Real-time
```bash
# PowerShell
python app.py | Select-String "ERROR|WARNING|✅"
```

---

## Performance Tips

1. **First startup is slow** (30-60 seconds) - models are loading
2. **Subsequent requests are fast** (< 1 second per face)
3. **Face detection quality** depends on YOLO weights training
4. **Database rebuilds** take time with many people - do infrequently

---

## Support

For issues:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Run `python diagnose.py`
3. Check startup logs for specific errors
4. Verify environment variables are set correctly
5. Ensure main backend is running (`node server.js` on port 3000)
