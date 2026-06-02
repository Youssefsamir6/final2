# 🚀 Quick Start - 5 Minutes

## The Simplest Way to Start Everything

### **Option 1: Single Command (Recommended)**
```powershell
cd d:\gp ai
.\START_ALL_SERVICES.bat
```

This opens 3 new terminal windows for:
1. AI Worker (Python)
2. Backend (Node.js)
3. Frontend (Next.js)

---

### **Option 2: Manual (4 Terminal Windows)**

**Terminal 1 - AI Worker:**
```powershell
cd 'd:\gp ai\smart-access-backend\ai-worker'
.\venv\Scripts\python.exe app.py
```

**Terminal 2 - Backend:**
```powershell
cd 'd:\gp ai\smart-access-backend'
npm run dev
```

**Terminal 3 - Frontend:**
```powershell
cd 'd:\gp ai\smart-main'
npm run dev
```

**Terminal 4 - Test (Optional):**
```powershell
cd 'd:\gp ai\smart-access-backend'
node test-ai-integration.js
```

---

## ✅ Verification

After starting, you should see:

```
✅ AI Worker:  http://localhost:5000/health  → Returns {"status": "ok"}
✅ Backend:    http://localhost:3000/health  → Returns {"status": "ok"}
✅ Frontend:   http://localhost:3001         → Opens web interface
✅ Database:   SQL Server running internally
```

---

## 🔗 Quick Links

| Service | URL |
|---------|-----|
| **Frontend UI** | http://localhost:3001 |
| **Backend API** | http://localhost:3000 |
| **AI Worker** | http://localhost:5000 |
| **Face DB Status** | http://localhost:3000/api/face-db/status |

---

## ⏱️ Startup Times

- AI Worker: ~5 seconds
- Backend: ~3 seconds  
- Frontend: ~8 seconds
- **Total: ~15-20 seconds**

---

## 🛑 Shutdown

- Close each terminal window, or
- Press `Ctrl+C` in each terminal

---

## ❌ If Something Goes Wrong

1. **Check all terminals are running** - Look for error messages
2. **Verify ports are available** - No other app using 3000, 3001, 5000
3. **Check database is running** - SQL Server must be started
4. **Review full guide** - See `SYSTEM_STARTUP_GUIDE.md`

---

**That's it! Your complete system is now running. 🎉**
