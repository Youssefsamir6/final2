# Smart Access & Monitoring System — Complete Demo Guide

**Version**: 1.0.0 (Demo Ready)  
**Last Updated**: June 5, 2026  
**Mode**: SQL Server Only (Production-Ready)  
**Demo Duration**: ~15-20 minutes

---

## 📋 Pre-Demo Checklist

Before starting the demo, verify all components are ready:

### System Requirements
- [ ] Windows OS with SQL Server Express running
- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed
- [ ] Webcam available (for camera client demo)

### Service Status Verification
```powershell
# Check SQL Server is running
Get-Service -Name "MSSQL$SQLEXPRESS" | Select-Object Name, Status
# Expected: Status = Running
```

---

## 🚀 Complete Startup Sequence

### Step 1: Start AI Worker (Terminal 1)

```powershell
# Navigate to AI Worker directory
cd "d:\gp ai\smart-access-backend\ai-worker"

# Create virtual environment if not exists
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start AI Worker
python app.py
```

**Expected Output:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:5000
```

**Verify AI Worker:**
```powershell
curl http://localhost:5000/health
# Expected: {"status":"ok","ai_available":true,"models_ready":true,"version":"1.0.0"}
```

---

### Step 2: Start Backend (Terminal 2)

```powershell
# Navigate to backend directory
cd "d:\gp ai\smart-access-backend"

# Install dependencies (first time only)
npm install

# Start backend server
npm start
```

**Expected Output:**
```
✓ Server running on port 3000
✓ Environment: development
✓ Database: SQL Server - 127.0.0.1:1433
✓ CORS enabled for: http://localhost:3000
✓ Logs location: ./logs/
```

**Verify Backend:**
```powershell
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"2026-06-05T21:00:00.000Z"}
```

---

### Step 3: Seed Test Data (Terminal 3)

```powershell
cd "d:\gp ai\smart-access-backend"
npm run seed
```

**Expected Output:**
```
🌱 Starting database seed...

📝 Creating test users...
  ✓ Created: admin@test.com (ID: 1)
  ✓ Created: guard@test.com (ID: 2)
  ✓ Created: user@test.com (ID: 3)

📋 Creating sample access logs...
  ✓ Created: face access (allowed)
  ✓ Created: face access (denied)
  ✓ Created: card access (allowed)
  ✓ Created: unknown access (denied)

✅ Database seed complete!
   Users created: 3
   Sample logs: 4

📌 Test Users:
   - admin@test.com / admin123
   - guard@test.com / guard123
   - user@test.com / user123
```

**Verify Seed:**
```powershell
curl http://localhost:3000/api/people
# Expected: Non-empty array of people
```

---

### Step 4: Start Frontend (Terminal 4)

```powershell
# Navigate to frontend directory
cd "d:\gp ai\smart-main"

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3001
  - Ready in xxxms
```

**Open Browser:**
```
http://localhost:3001
```

---

## 🎯 Demo Flow (Step-by-Step)

### Phase 1: Authentication Demo (2 minutes)

**1. Login to the system:**
- Open browser: `http://localhost:3001`
- Click "Login" or navigate to login page
- Use credentials: `admin@test.com` / `admin123`
- Verify JWT token is received and stored

**Expected Result:**
- Successful login
- Redirected to dashboard
- User name displayed in header

---

### Phase 2: Live Dashboard Demo (3 minutes)

**2. Show the dashboard:**
- Navigate to Dashboard page
- Point out the following sections:
  - **Live Logs**: Real-time access events
  - **Alerts Panel**: Unauthorized access attempts
  - **Statistics**: Current system status
  - **Sound Alert Toggle**: Mute/unmute button

**Expected Result:**
- Dashboard loads with seeded data
- Socket.io connection established (check browser console)
- Live updates ready to receive events

---

### Phase 3: Face Enrollment Demo (3 minutes)

**3. Enroll a new person:**
- Navigate to "Face Enrollment" section
- Choose "Camera Capture" or "Upload Photo"
- Capture/upload a clear face photo
- Fill in the form:
  - Name: "Demo User"
  - Type: "Student"
  - Student ID: "STU_DEMO_001"
- Click "Enroll Person"

**Expected Result:**
- Success toast notification
- New person appears in "Enrolled People" list
- Face added to AI recognition database

**Verify Enrollment:**
```powershell
curl http://localhost:5000/db-status
# Expected: "people" count increased by 1
```

---

### Phase 4: Recognition Demo (5 minutes)

**4. Test face recognition:**

**Option A: Using Camera Client (if webcam available)**
```powershell
cd "d:\gp ai\smart-access-backend\camera-client"

# Create virtual environment if not exists
python -m venv venv
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Run camera client with preview
python camera_client.py --preview
```

**Option B: Using API directly**
```powershell
# Get auth token first
$token = (curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@test.com","password":"admin123"}' | ConvertFrom-Json).data.token

# Send recognition request
curl -X POST http://localhost:3000/api/ai/device/smart-access `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"image":"data:image/jpeg;base64,/9j/4AAQ...","deviceId":"demo-cam","gateName":"Main Gate"}'
```

**Expected Result:**
- If enrolled face matches: `{"status":"authorized","confidence":0.85+}`
- If unknown face: `{"status":"denied","confidence":0.0}`
- Dashboard updates in real-time
- Sound alert plays (authorized = pleasant tones, denied = buzzer)

---

### Phase 5: Time-Based Access Control Demo (2 minutes)

**5. Demonstrate time-window restriction:**

The system implements time-based access control (8 AM - 6 PM). To demonstrate:

**During allowed hours (8 AM - 6 PM):**
- Enrolled user → Authorized
- Unknown user → Denied

**Outside allowed hours (before 8 AM or after 6 PM):**
- Even enrolled users → Denied (with reason: "Outside time window")

**To simulate outside hours for demo:**
1. Temporarily modify `smart-access-backend/services/accessEvent.service.js`
2. Change line 53 from `now.getHours() >= 8 && now.getHours() <= 18` to a time that's currently false
3. Restart backend
4. Test recognition → Will show "denied" even for enrolled users

---

### Phase 6: Sound Alerts Demo (1 minute)

**6. Demonstrate audio feedback:**
- Show the mute/unmute button in the dashboard
- Trigger an authorized access → Hear pleasant ascending tones
- Trigger a denied access → Hear low buzzer sound
- Toggle mute and verify sounds are silenced

---

## 📊 Verification Commands

### Health Checks
```powershell
# Backend health
curl http://localhost:3000/health

# AI Worker health
curl http://localhost:5000/health

# Face database status
curl http://localhost:5000/db-status
```

### API Endpoint Tests
```powershell
# List all people
curl http://localhost:3000/api/people

# List access logs
curl http://localhost:3000/api/logs

# List alerts
curl http://localhost:3000/api/alerts

# Get analytics
curl http://localhost:3000/api/analytics/realtime
```

### Integration Tests
```powershell
cd "d:\gp ai\smart-access-backend"
npm test
```

**Expected Output:**
```
════════════════════════════════════════════════════════════
AI FACE RECOGNITION INTEGRATION TEST SUITE
════════════════════════════════════════════════════════════

ℹ️  Backend URL: http://localhost:3000
ℹ️  AI Worker URL: http://localhost:5000

✅ Passed: AI Worker Health Check
✅ Passed: Database Status Check
✅ Passed: Backend Health Check
...

════════════════════════════════════════════════════════════
Passed: 9/9
════════════════════════════════════════════════════════════
```

---

## 🛠️ Troubleshooting

### Issue: SQL Server connection failed
**Solution:**
```powershell
# Start SQL Server service
Get-Service MSSQL$SQLEXPRESS | Start-Service

# Verify connection
sqlcmd -S 127.0.0.1 -U YOUSSEF -P test123 -Q "SELECT @@VERSION"
```

### Issue: Port already in use
**Solution:**
```powershell
# Find and kill process on port 3000
$pid = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess
if ($pid) { Stop-Process -Id $pid -Force }

# Find and kill process on port 5000
$pid = (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess
if ($pid) { Stop-Process -Id $pid -Force }
```

### Issue: AI Worker models not loading
**Solution:**
- Wait 30-60 seconds for model initialization
- Check `http://localhost:5000/health` until `models_ready` is true
- Verify YOLO weights file exists at expected path

### Issue: Camera not found
**Solution:**
- Check camera permissions in Windows settings
- Try different camera index: `python camera_client.py --camera 1`
- Use API testing instead if no camera available

---

## 📝 Demo Script for Committee Presentation

> **"Welcome to the Smart Access & Monitoring System.**
>
> This is a comprehensive access control solution that combines:
> - **Face Recognition AI** for identity verification
> - **Real-time Monitoring** with live dashboard
> - **Audio Alerts** for immediate feedback
> - **Time-based Access Control** for security
>
> Let me demonstrate the complete workflow:
>
> **1. First, we enroll a new person** *(navigate to Face Enrollment)*
> - Capture a photo using the camera
> - Enter their details
> - The system stores the face embedding in the AI database
>
> **2. Now, let's test recognition** *(run camera client or API test)*
> - When an enrolled person approaches, they're authorized
> - Listen for the success sound
> - Watch the dashboard update in real-time
>
> **3. For security, unknown faces are denied**
> - Hear the denial alert
> - See the alert appear in the alerts panel
>
> **4. Time-based restrictions add another security layer**
> - Even enrolled users can be denied outside allowed hours
>
> All data is stored securely in SQL Server, with zero cloud dependency."

---

## 🎬 Quick Start Commands (Copy/Paste)

```powershell
# Terminal 1: AI Worker
cd "d:\gp ai\smart-access-backend\ai-worker"
.\venv\Scripts\Activate
python app.py

# Terminal 2: Backend
cd "d:\gp ai\smart-access-backend"
npm start

# Terminal 3: Seed Data (run once)
cd "d:\gp ai\smart-access-backend"
npm run seed

# Terminal 4: Frontend
cd "d:\gp ai\smart-main"
npm run dev

# Terminal 5: Camera Client (optional)
cd "d:\gp ai\smart-access-backend\camera-client"
.\venv\Scripts\Activate
python camera_client.py --preview
```

---

## ✅ Final Demo Readiness Checklist

| Item | Status | Verification |
|------|--------|--------------|
| SQL Server running | ⬜ | `Get-Service MSSQL$SQLEXPRESS` |
| AI Worker healthy | ⬜ | `curl http://localhost:5000/health` |
| Backend healthy | ⬜ | `curl http://localhost:3000/health` |
| Test data seeded | ⬜ | `curl http://localhost:3000/api/people` |
| Frontend running | ⬜ | Browser: `http://localhost:3001` |
| Login works | ⬜ | admin@test.com / admin123 |
| Enrollment works | ⬜ | Add new person via UI |
| Recognition works | ⬜ | Camera client or API test |
| Dashboard updates | ⬜ | Real-time logs visible |
| Sound alerts work | ⬜ | Hear tones for authorized/denied |
| Integration tests pass | ⬜ | `npm test` |

---

**Status**: ✅ READY FOR DEMO  
**Support**: Check logs in `./logs/` directory for debugging