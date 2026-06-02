# AI Face Recognition Integration Guide

## Overview

This document explains how the AI face recognition system is integrated with the Smart Access backend. The integration bridges the Node.js Express backend with the Python FastAPI AI worker that handles face detection and recognition.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Smart Access Backend (Node.js)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express Server (Port 3000)                            │ │
│  │  - Routes: /api/ai/*, /api/face-db/*                  │ │
│  │  - Controllers: ai.controller, faceDatabase.controller│ │
│  │  - Services: ai.service, faceDatabase.service         │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Requests (axios)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            AI Worker (Python FastAPI)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  FastAPI Server (Port 5000)                            │ │
│  │  - Endpoints: /recognize, /embedding, /add-person      │ │
│  │  - Services: FaceRecognition models                    │ │
│  │  - Database: Face database (folder structure)          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components

### Backend Routes

#### Face Recognition API (`/api/ai/*)
- `POST /api/ai/device/recognition` - Recognize face from image (device auth)
- `POST /api/ai/device/smart-access` - Make smart access decision (device auth)
- `POST /api/ai/admin/recognition` - Recognize face (admin only)
- `POST /api/ai/admin/extract-embedding` - Extract face embedding (admin only)

#### Face Database Management (`/api/face-db/*`)
- `GET /api/face-db/health` - Check AI worker health
- `GET /api/face-db/status` - Get database status (admin only)
- `POST /api/face-db/add-person` - Add person to database (admin only)
- `POST /api/face-db/rebuild` - Rebuild recognition database (admin only)

### AI Worker Endpoints

#### Core Recognition
- `POST /recognize` - Recognize face from base64 image
  - Input: `{ image: string, embedding_dim?: number }`
  - Output: `{ userId: string|null, confidence: float, embedding: [float], reason: string }`

- `POST /embedding` - Extract face embedding
  - Input: `{ image: string }`
  - Output: `{ embedding: [float], reason: string }`

#### Database Management
- `GET /health` - Health check
- `GET /db-status` - Get database status
- `POST /add-person` - Add person to database
- `POST /rebuild-db` - Rebuild recognition database

## Setup Instructions

### 1. Install AI Worker Dependencies

```bash
cd smart-access-backend/ai-worker
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file in `ai-worker/` directory:

```bash
cp .env.example .env
# Edit .env with your configuration if needed
```

### 3. Prepare Face Database

The face database should be organized as follows:

```
face_database/
├── person_1_name/
│   ├── image_1.jpg
│   ├── image_2.jpg
│   └── ...
├── person_2_name/
│   ├── image_1.jpg
│   └── ...
└── ...
```

Each person should have 1-3 clear face images for optimal recognition.

### 4. Start AI Worker

```bash
cd smart-access-backend/ai-worker
python app.py
# or
uvicorn app:app --host 0.0.0.0 --port 5000 --reload
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:5000
Initializing AI models...
✅ AI models initialized successfully
```

### 5. Update Backend Configuration

In `smart-access-backend/.env`, ensure:

```
AI_URL=http://localhost:5000
```

### 6. Start Backend

```bash
cd smart-access-backend
npm install
npm start
# or for development
npm run dev
```

## Testing

### Run Integration Tests

```bash
cd smart-access-backend
node test-ai-integration.js
```

Expected output:
```
✅ AI Worker Health Check
✅ Database Status Check
✅ Backend Health Check
✅ Face DB Health Endpoint
✅ Recognition Endpoint
✅ Embedding Endpoint
✅ Add Person Endpoint
✅ Rebuild Database Endpoint
✅ Backend AI Routes

Passed: 9/9
```

### Manual Testing with cURL

#### Test Recognition

```bash
# Get a sample image (base64 encoded)
curl -X POST http://localhost:5000/recognize \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "embedding_dim": 128
  }'
```

#### Check Database Status

```bash
curl http://localhost:5000/db-status
```

#### Check AI Worker Health

```bash
curl http://localhost:5000/health
```

## API Usage Examples

### 1. Recognize Face (Device)

```bash
curl -X POST http://localhost:3000/api/ai/device/recognition \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <DEVICE_TOKEN>" \
  -F "image=@face.jpg" \
  -F "deviceId=gate_01" \
  -F "gateName=Main Gate"
```

### 2. Extract Embedding (Admin)

```bash
curl -X POST http://localhost:3000/api/ai/admin/extract-embedding \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "image=@face.jpg"
```

### 3. Get Face Database Status (Admin)

```bash
curl http://localhost:3000/api/face-db/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### 4. Add Person to Database (Admin)

```bash
curl -X POST http://localhost:3000/api/face-db/add-person \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "userId=john_doe" \
  -F "image=@john_face.jpg"
```

## Troubleshooting

### AI Worker Not Starting

**Error:** `Module not found: backend.services.model_service`

**Solution:** Ensure the path to FaceRecognition_Project is correct in `app.py`:
```python
sys.path.insert(0, str(Path(__file__).parent.parent / "coll_project_9" / "FaceRecognition_Project"))
```

### Models Not Loading

**Error:** `FileNotFoundError: YOLO weights not found`

**Solution:** Ensure `best.pt` exists in the FaceRecognition_Project root directory.

### Connection Refused

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5000`

**Solution:** 
1. Check that AI worker is running: `python app.py`
2. Verify `AI_URL` in backend `.env` matches the AI worker URL
3. Check firewall settings

### Face Detection Not Working

**Error:** `No face detected` responses

**Solution:**
1. Verify image quality and face visibility
2. Check YOLO confidence threshold in `.env`
3. Ensure face database is properly populated
4. Run `/rebuild-db` endpoint to rebuild database

### Low Recognition Confidence

**Cause:** Model not trained on enough data or poor image quality

**Solution:**
1. Add more face images to the database (3-5 images per person)
2. Use clear, well-lit images
3. Adjust `COSINE_THRESHOLD` in `.env` (default 0.5)
4. Rebuild database after adding new images

## Performance Optimization

### Model Selection

The system uses:
- **YOLO**: Face detection (fast, accurate)
- **InsightFace (buffalo_l)**: Face embedding (high accuracy)
- **Hybrid Recognition**: Combines embeddings with handcrafted features (best accuracy)

### Configuration Tuning

```env
# For faster recognition (lower quality)
YOLO_CONF=0.65
COSINE_THRESHOLD=0.6

# For higher accuracy (slower)
YOLO_CONF=0.45
COSINE_THRESHOLD=0.4
```

### Database Management

Keep the face database organized and up-to-date:
1. Remove outdated or duplicate images
2. Run `/rebuild-db` regularly
3. Monitor database size (max 10MB per person recommended)

## Security Considerations

1. **Authentication:** All face database management endpoints require admin authentication
2. **Rate Limiting:** Recognition endpoints are rate-limited (default: 100 requests/15 minutes)
3. **Image Storage:** Face images are stored server-side in organized directories
4. **SSL/TLS:** Use HTTPS in production
5. **API Keys:** Device endpoints use API key authentication

## Monitoring

Monitor these metrics:
- Average recognition confidence
- Recognition latency (target: <500ms)
- Database size and people count
- Failed recognitions (analyze patterns)
- Model initialization time

Check logs:
```bash
# Backend logs
tail -f logs/access.log
tail -f logs/error.log

# AI Worker logs
# Check console output where uvicorn is running
```

## Future Enhancements

1. **Real-time Face Tracking:** Use streaming endpoint for continuous monitoring
2. **Face Enrollment UI:** Web interface for adding faces
3. **Analytics Dashboard:** Recognition statistics and reports
4. **Multi-face Recognition:** Handle multiple people in single image
5. **Quality Assessment:** Automatic image quality check before enrollment
6. **Biometric Verification:** Additional face verification methods

## References

- [Face Recognition Project](../ai/coll_project_9/FaceRecognition_Project/)
- [AI Worker Code](./ai-worker/)
- [Backend Integration](./services/ai.service.js)
- [API Routes](./routes/ai.routes.js)
