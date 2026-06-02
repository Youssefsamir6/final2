# Smart Secure Campus - Backend

Smart Access Backend with Face Recognition, Real-time Logs/Alerts via Socket.io, SQL Server Database.

## Features
- Face recognition (Python face_recognition + OpenCV)
- Device auth (API keys)
- Real-time dashboard (Socket.io rooms for 'logs')
- Admin user/face management
- Access logs with auto alerts
- Image upload support (base64/multipart via Multer)
- SQL Server database with parameterized queries

## Quick Start

### 1. Backend Setup
```bash
cp .env.example .env  # Edit MONGODB_URI, JWT_SECRET
npm install
node seed.js  # Seed users with face data
npm start     # Runs on http://localhost:3000
```

### 2. AI Worker (Face Recognition)
```bash
cd ai-worker
pip install -r requirements.txt
python app.py  # Runs on http://localhost:5000/health
```

### 3. Camera Worker (Optional)
```bash
cd ai-worker
python camera_worker.py  # Captures frames and sends to backend
```

## Environment Variables
See [.env.example](.env.example) for complete list.

Key variables:
- `DB_SERVER` - SQL Server hostname/IP
- `DB_DATABASE` - Database name
- `DB_PORT` - SQL Server port
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret for JWT token signing
- `NODE_ENV` - Environment (development/production)
- `DEVICE_API_KEY` - API key for device authentication

## API Endpoints

### Device / Camera Authentication
```
POST /api/ai/device/smart-access
Headers:
  X-API-Key: dev-key-123
  Content-Type: multipart/form-data

Body:
  - image (file or base64)
  - deviceId (string)
  - gateName (string)
```

Response:
```json
{
  "decision": {
    "confidence": 0.95,
    "userId": "user123"
  },
  "access": {
    "status": "authorized"
  }
}
```

### Admin Endpoints
```
Requires: Bearer token with admin role

POST /api/users/:id/face-images
Upload face images for a user (extracts embeddings via AI)

GET /api/logs?deviceId=cam-main&confidence_min=0.8&startDate=2024-01-01
Fetch access logs with filtering
```

## Testing with cURL

```bash
curl -X POST http://localhost:3000/api/ai/device/smart-access \
  -H "X-API-Key: dev-key-123" \
  -F "image=@test.jpg" \
  -F "deviceId=cam-main-gate" \
  -F "gateName=Main Gate"
```

## Complete Flow

1. **Camera captures frame** → POST `/api/ai/device/smart-access`
2. **Backend processes** → Sends to AI worker for face recognition
3. **Decision & Logging** → Stores access event, emits to Socket.io 'logs' room
4. **Real-time Dashboard** → Subscribers receive instant updates

## Database: SQL Server
Using the `mssql` package for database connections. Supports parameterized queries for SQL injection prevention.

### Real-time Events (Socket.io)
- **'logs'** room: Broadcasts `access_event` and `alert` events to connected clients
- Subscribe on frontend to receive real-time updates

## Production Deployment

- **Containerize**: Docker for backend, AI worker, and camera services
- **Database**: Azure SQL Database or SQL Server with backups
- **Email Alerts**: Configure Nodemailer with SMTP credentials
- **API Security**: Use environment-based API keys, enable CORS policies
- **Monitoring**: Set up Sentry for error tracking
- **SQL Server Security**: Enable Windows authentication, strong passwords, restricted user permissions

