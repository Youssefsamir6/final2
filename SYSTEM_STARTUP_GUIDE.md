# 🚀 Complete System Startup Guide

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│                    http://localhost:3001                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ Calls API
┌──────────────────────▼──────────────────────────────────────┐
│              Backend (Express.js)                           │
│              http://localhost:3000                          │
│  • Authentication & Authorization                          │
│  • Database Operations                                     │
│  • AI Integration                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
    ┌─────▼────┐  ┌───▼────┐  ┌──▼────────┐
    │SQL Server│  │Socket.io│  │AI Worker  │
    │Database  │  │         │  │(Python)   │
    │Port 1433 │  │Real-time│  │Port 5000  │
    └──────────┘  └─────────┘  └───┬──────┘
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                   ┌────▼────┐         ┌─────────▼───┐
                   │YOLO v8  │         │InsightFace  │
                   │Detection│         │Recognition  │
                   └─────────┘         └─────────────┘
```

---

## Prerequisites

### 1. **Database Setup**
- ✅ SQL Server Express (SQLEXPRESS01) installed and running
- ✅ Database initialized with schema
- Connection: `localhost\SQLEXPRESS01` | DB: `smart_access_system`

### 2. **Node.js & npm**
```powershell
node --version   # Should be v18+
npm --version    # Should be v9+
```

### 3. **Python & Virtual Environment**
```powershell
python --version # Should be v3.8+
```

### 4. **Verify Directory Structure**
```
d:\gp ai\
├── smart-access-backend/     ← Backend (Node.js)
├── smart-main/               ← Frontend (Next.js)
└── ai/
    └── coll_project_9/
        └── FaceRecognition_Project/  ← AI Models
```

---

## ⚡ Quick Start (All in One Command)

### **Option 1: Using Batch File (Windows)**
```powershell
cd d:\gp ai\smart-access-backend
npm run dev:full
```

This runs backend + AI worker concurrently. **Then in another terminal**, start the frontend.

### **Option 2: Manual Setup (Recommended for Development)**

Use **4 separate terminals**:

---

## 📋 Step-by-Step Startup (4 Terminals)

### **Terminal 1: AI Worker (Python)**
```powershell
cd 'd:\gp ai\smart-access-backend\ai-worker'
.\venv\Scripts\python.exe app.py
```

**Expected Output:**
```
INFO:     Started server process [xxxxx]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:5000
```

✅ **AI Worker is running on PORT 5000**

---

### **Terminal 2: Backend Server (Node.js)**
```powershell
cd 'd:\gp ai\smart-access-backend'
npm install          # First time only
npm run dev          # or: node server.js
```

**Expected Output:**
```
Server running on port 3000
Connected to database
```

✅ **Backend is running on PORT 3000**

---

### **Terminal 3: Frontend (Next.js)**
```powershell
cd 'd:\gp ai\smart-main'
npm install          # First time only
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000
```

✅ **Frontend is running (usually on PORT 3001 if 3000 is taken)**

---

### **Terminal 4: Test Suite (Optional)**
```powershell
cd 'd:\gp ai\smart-access-backend'
node test-ai-integration.js
```

**Expected Output:**
```
✅ Passed: 9/9
```

---

## 🔍 Verification Checklist

Run these commands to verify everything is working:

```powershell
# Check AI Worker Health
curl http://localhost:5000/health

# Check Backend Health
curl http://localhost:3000/health

# Test Face DB Status
curl http://localhost:3000/api/face-db/health

# Access Frontend
Start-Process http://localhost:3001
```

---

## 🌐 Access Points

| Component | URL | Purpose |
|-----------|-----|---------|
| **Frontend** | http://localhost:3001 | Main UI |
| **Backend API** | http://localhost:3000 | REST API |
| **AI Worker** | http://localhost:5000 | Face Recognition |
| **AI Health** | http://localhost:5000/health | Worker status |
| **DB Status** | http://localhost:3000/api/face-db/status | Face DB info |
| **Database** | localhost\SQLEXPRESS01 | SQL Server |

---

## 📚 Environment Configuration

### **Backend (.env)**
Location: `smart-access-backend/.env`
```env
PORT=3000
NODE_ENV=development
AI_URL=http://localhost:5000
DB_SERVER=localhost\SQLEXPRESS01
DB_NAME=smart_access_system
DB_USER=YOUSSEF
DB_PASSWORD=test123
USE_MOCK_DB=false
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_change_in_prod
```

### **AI Worker (.env)**
Location: `smart-access-backend/ai-worker/.env`
```env
PORT=5000
PROJECT_BASE_DIR=D:\gp ai\ai\coll_project_9\FaceRecognition_Project
```

---

## 🎯 Common Issues & Solutions

### **Port Already in Use**
```powershell
# Kill process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Kill process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

### **Database Connection Failed**
```powershell
# Check SQL Server status
Get-Service MSSQLSERVER

# Start it if stopped
Start-Service MSSQLSERVER
```

### **Python Virtual Environment Issues**
```powershell
cd 'smart-access-backend/ai-worker'
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### **npm dependencies missing**
```powershell
cd smart-access-backend
npm install --force

cd smart-main
npm install --force
```

### **Module not found: ultralytics**
This is normal - AI runs in **fallback mode** without actual YOLO/InsightFace models.
Install full AI support:
```powershell
cd 'smart-access-backend/ai-worker'
pip install ultralytics insightface onnxruntime
```

---

## 🧪 Testing Endpoints

### **Add a Test User (via Backend)**
```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### **Test Face Recognition**
```powershell
# Rebuild face database
curl -X POST http://localhost:3000/api/face-db/rebuild

# Get database status
curl http://localhost:3000/api/face-db/status
```

---

## 🚦 Startup Summary

| Step | Command | Port | Status |
|------|---------|------|--------|
| 1. AI Worker | `.\venv\Scripts\python.exe app.py` | 5000 | ✅ |
| 2. Backend | `npm run dev` | 3000 | ✅ |
| 3. Frontend | `npm run dev` | 3001 | ✅ |
| 4. Database | (Already running) | 1433 | ✅ |

**Total: ~2 minutes to full system startup**

---

## 📝 What Each Service Does

### **Frontend (smart-main)**
- User interface for access control
- Real-time monitoring dashboard
- User authentication
- Access logs & analytics
- Face database management

### **Backend (smart-access-backend)**
- REST API endpoints
- Authentication & JWT tokens
- Database queries
- Face recognition requests
- Real-time WebSocket updates
- Error handling & logging

### **AI Worker (ai-worker)**
- Face detection (YOLO)
- Face recognition (InsightFace)
- Face embedding generation
- Database management (add/rebuild)
- Fallback mode support

### **Database (SQL Server)**
- User accounts & roles
- Access logs
- System configuration
- Analytics data

---

## 🔐 Security Notes for Production

1. Change `JWT_SECRET` in `.env` to a strong random string
2. Use HTTPS instead of HTTP
3. Add firewall rules (restrict port access)
4. Enable SQL Server authentication
5. Set `NODE_ENV=production`
6. Use environment variables for secrets
7. Enable CORS only for trusted domains

---

## 📖 Useful Commands

```powershell
# Database operations
npm run seed                    # Seed initial data
npm run create:superuser       # Create admin user
npm run db:optimize            # Optimize database

# Development
npm run dev                     # Frontend/Backend dev mode
npm run start                   # Production mode

# Testing
node test-ai-integration.js    # Run integration tests

# AI Worker
cd ai-worker; npm run worker   # Run AI worker only
```

---

## 🆘 Need Help?

1. **Check logs**: Look at terminal output for errors
2. **Verify ports**: `netstat -tuln` or use Task Manager
3. **Test endpoints**: Use curl or Postman
4. **Check database**: SQL Server Management Studio
5. **Review configs**: `.env` files in each directory

---

**🎉 System is ready to run!**
