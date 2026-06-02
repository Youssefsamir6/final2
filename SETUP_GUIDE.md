# Smart Access & Monitoring System - Complete Setup Guide

(نظام ذكي للدخول والمراقبة)

## 🎯 Project Overview

This is a complete **Smart Access & Monitoring System** for campus/building access control using face recognition. The system consists of:

1. **Face Recognition AI** - Python-based face detection and recognition
2. **Backend API** - Node.js/Express server with SQL Server database
3. **Admin Dashboard** - Next.js web interface for monitoring and management
4. **Camera Client** - Python application for entrance gate camera integration

## 📋 System Requirements

### Hardware
- Camera (webcam or USB camera) for face capture
- Minimum 4GB RAM (8GB recommended for AI)
- 10GB free disk space

### Software
- **Node.js 18+** - Backend and Frontend
- **Python 3.8+** - AI Worker and Camera Client
- **SQL Server** - Database (Express or full version)
- **Git** - Version control

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd smart-access-system

# Install backend dependencies
cd smart-access-backend
npm install

# Install frontend dependencies
cd ../smart-main
npm install

# Install AI Worker dependencies
cd ../smart-access-backend/ai-worker
pip install -r requirements.txt

# Install Camera Client dependencies
cd ../camera-client
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Navigate to database folder
cd database

# Run SQL Server setup script
sqlcmd -S localhost\SQLEXPRESS -U sa -P your_password -i final_pro.sql

# Or open SQL Server Management Studio and run the script manually
```

### 3. Configure Environment

#### Backend (.env)
```bash
cd smart-access-backend
cp .env.example .env
# Edit .env with your settings
```

Key settings:
```
# SQL Server
DB_SERVER=127.0.0.1
DB_DATABASE=smart_access_system
DB_USER=smartaccess
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your-secret-key-here

# API Keys
DEVICE_API_KEY=dev-key-123
ADMIN_API_KEY=admin-key-123

# Server
PORT=3000

# AI Worker
AI_WORKER_URL=http://localhost:5000

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```bash
cd smart-main
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:3000" >> .env.local
```

### 4. Start All Services

#### Option A: Using Startup Scripts (Windows)
```bash
# From project root
START_ALL_SERVICES.bat
```

#### Option B: Manual Startup

**Terminal 1 - Backend:**
```bash
cd smart-access-backend
npm start
```

**Terminal 2 - AI Worker:**
```bash
cd smart-access-backend/ai-worker
python app.py
```

**Terminal 3 - Frontend:**
```bash
cd smart-main
npm run dev
```

**Terminal 4 - Camera Client (at entrance gate):**
```bash
cd smart-access-backend/camera-client
python camera_client.py --preview
```

## 📁 Project Structure

```
smart-access-system/
├── smart-access-backend/          # Node.js Backend API
│   ├── ai-worker/                 # Python AI Service (Face Recognition)
│   │   ├── app.py                 # FastAPI AI server
│   │   ├── requirements.txt       # Python dependencies
│   │   └── README_AI_WORKER.md
│   ├── camera-client/             # Camera Client for Entrance Gate
│   │   ├── camera_client.py       # Main camera application
│   │   ├── requirements.txt       # Python dependencies
│   │   ├── .env.example          # Configuration template
│   │   └── README.md
│   ├── config/                    # Configuration files
│   ├── controllers/               # API controllers
│   ├── routes/                    # API routes
│   ├── services/                  # Business logic
│   ├── server.js                  # Main server file
│   └── package.json
│
├── smart-main/                    # Next.js Admin Dashboard
│   ├── src/
│   │   ├── app/                   # Next.js App Router
│   │   ├── components/            # React components
│   │   │   └── dashboard/         # Dashboard components
│   │   │       ├── SoundAlert.tsx # Audio alert system
│   │   │       ├── FaceEnrollment.tsx # Face enrollment UI
│   │   │       └── ...
│   │   ├── context/               # React Context providers
│   │   ├── hooks/                 # Custom hooks
│   │   ├── lib/                   # Utilities
│   │   └── types/                 # TypeScript types
│   ├── package.json
│   └── README.md
│
├── ai/                            # AI Models and Face Database
│   └── coll_project_9/
│       └── FaceRecognition_Project/
│           ├── backend/           # AI backend services
│           ├── core_ai/           # Core AI modules
│           ├── face_database/     # Stored face encodings
│           └── best.pt            # YOLO face detection model
│
├── database/                      # Database Scripts
│   ├── final_pro.sql             # Main database schema
│   ├── create-superuser.sql      # Admin user creation
│   └── setup-db.sql
│
├── START_ALL_SERVICES.bat        # Windows startup script
├── START_ALL_SERVICES.ps1        # PowerShell startup script
├── SETUP_GUIDE.md                # This file
└── README.md                      # Main documentation
```

## 🔧 Component Details

### 1. Backend API (Port 3000)

**Key Endpoints:**
- `POST /api/auth/login` - Admin login
- `GET /api/logs` - Access logs
- `GET /api/alerts` - Security alerts
- `POST /api/ai/device/smart-access` - Device face recognition
- `GET /api/people` - List enrolled people
- `POST /api/people` - Enroll new person
- `GET /api/analytics/overview` - Statistics

### 2. AI Worker (Port 5000)

**Key Endpoints:**
- `GET /health` - Health check
- `POST /recognize` - Recognize face from image
- `POST /embedding` - Extract face embedding
- `POST /add-person` - Add person to face database
- `GET /db-status` - Face database status
- `POST /rebuild-db` - Rebuild recognition database

### 3. Admin Dashboard (Port 3001 dev)

**Pages:**
- `/login` - Admin login
- `/dashboard` - Main monitoring dashboard
- `/dashboard/live` - Live activity feed
- `/dashboard/alerts` - Security alerts
- `/dashboard/enrollment` - Face enrollment (NEW)

**Features:**
- Real-time access monitoring via Socket.io
- Audio alerts for access events (NEW)
- Face enrollment with camera/upload (NEW)
- Analytics and reports

### 4. Camera Client

**Usage:**
```bash
# Run with preview
python camera_client.py --preview

# Single capture
python camera_client.py --single

# Test connection
python camera_client.py --test

# Custom settings
python camera_client.py --camera 1 --gate "Building A"
```

**Keyboard Controls:**
- `q` - Quit
- `c` - Manual capture

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access - manage users, view all logs, configure system |
| **Operator** | Enroll people, view logs, manage alerts |
| **Viewer** | View-only access to dashboard |
| **Device** | API access for camera clients |

## 🎯 Workflow

### Enrolling a New Person

1. **Via Dashboard:**
   - Go to `/dashboard/enrollment`
   - Capture photo via camera OR upload image
   - Fill in name, type, and student ID
   - Click "Enroll Person"

2. **Via API:**
   ```bash
   curl -X POST http://localhost:3000/api/people \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "type": "student",
       "studentId": "12345",
       "photo": "data:image/jpeg;base64,..."
     }'
   ```

### Access Control Flow

1. **Camera captures face** at entrance gate
2. **Camera Client** sends image to backend
3. **Backend** calls AI Worker for recognition
4. **AI Worker** returns recognized user ID and confidence
5. **Backend** checks user status and time rules
6. **Backend** logs the access event and emits via Socket.io
7. **Dashboard** updates in real-time with result
8. **Audio alert** plays (green for authorized, red for denied)

## 🔊 Audio Alerts

The system plays different sounds for different events:

| Event | Sound |
|-------|-------|
| **Access Granted** | Pleasant ascending tones (C5-E5-G5) |
| **Access Denied** | Low buzzer sound |
| **Security Alert** | Urgent triple beep |

**Mute/Unmute:** Click the volume icon in the topbar

## 🛠️ Troubleshooting

### Camera Not Working
```bash
# List available cameras (Linux/Mac)
ffmpeg -f avfoundation -list_devices true -i ""

# Try different camera index
python camera_client.py --camera 1
```

### AI Worker Not Starting
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
cd smart-access-backend/ai-worker
pip install -r requirements.txt --force-reinstall
```

### Database Connection Failed
```bash
# Test SQL Server connection
sqlcmd -S localhost\SQLEXPRESS -U smartaccess -P your_password -Q "SELECT @@VERSION"

# Check SQL Server is running
# Windows: services.msc -> SQL Server
# Linux: sudo systemctl status mssql-server
```

### Backend Won't Start
```bash
# Check port is available
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Check .env configuration
cat smart-access-backend/.env
```

### Frontend Build Errors
```bash
# Clear cache and rebuild
cd smart-main
rm -rf .next node_modules
npm install
npm run build
```

## 📊 Database Schema

### Key Tables

**users** - System users (admins, operators)
```sql
id, name, email, password, role, status, created_at
```

**people** - Enrolled people for face recognition
```sql
id, name, type, student_id, photo, status, created_at
```

**access_logs** - All access events
```sql
id, user_id, status, access_time, device_id, gate_name, confidence
```

**security_alerts** - Security notifications
```sql
id, alert_type, description, severity, user_id, created_at, status
```

## 🔐 Security

- **JWT Authentication** for admin/users
- **API Key Authentication** for devices
- **HTTPS** in production (required)
- **Rate Limiting** on all endpoints
- **Input Validation** and sanitization
- **SQL Injection Prevention** (parameterized queries)
- **CORS** configured for specific origins

## 🚀 Production Deployment

### Environment Variables (Production)

```bash
# Backend .env
NODE_ENV=production
PORT=3000
DB_SERVER=your-sql-server-host
DB_DATABASE=smart_access_prod
DB_USER=prod_user
DB_PASSWORD=strong-password-here
JWT_SECRET=very-long-random-secret-key
DEVICE_API_KEY=production-device-key
ADMIN_API_KEY=production-admin-key
CORS_ORIGIN=https://your-domain.com
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Services:
# - backend:5000
# - ai-worker:5001
# - frontend:3000
# - sqlserver:1433
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;  # Frontend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;  # Backend
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review individual component READMEs

## 📄 License

Proprietary - Smart Access System. All rights reserved.

---

**Last Updated:** June 2026  
**Version:** 1.0.0