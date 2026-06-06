# Demo Ready (Combined) — Smart Access System

This is a single, simplified guide built by combining the most relevant parts of:
- `README.md`
- `QUICK_START.md`
- `SETUP_GUIDE.md`
- `SYSTEM_STARTUP_GUIDE.md`
- `START_ALL_SERVICES.bat` / `START_ALL_SERVICES.ps1`
- `START_DEMO_COMPLETE.bat`
- `SYSTEM_STATUS_PRODUCTION.md`
- `VALIDATION_REPORT.md`

---

## 1) Start services (fast)

### Option A: One-click startup
Run:
```powershell
cd "d:\gp ai"
.\START_DEMO_COMPLETE.bat
```
This starts (new windows):
- AI Worker (Python) on `http://localhost:5000`
- Backend (Node/Express) on `http://localhost:3000`
- Frontend (Next.js) on `http://localhost:3001`
- Seeds demo data for UI testing (via `npm run seed`)

### Option B: Start manually (4 terminals)
Terminal 1 (AI Worker):
```powershell
cd "d:\gp ai\smart-access-backend\ai-worker"
.venv\Scripts\activate
python app.py
```
Verify:
```powershell
curl http://localhost:5000/health
```

Terminal 2 (Backend):
```powershell
cd "d:\gp ai\smart-access-backend"
npm start
```
Verify:
```powershell
curl http://localhost:3000/health
```

Terminal 3 (Seed):
```powershell
cd "d:\gp ai\smart-access-backend"
npm run seed
```

Terminal 4 (Frontend):
```powershell
cd "d:\gp ai\smart-main"
npm run dev
```
Open:
- `http://localhost:3001`

---

## 2) Verify all 3 services are up

```powershell
curl http://localhost:5000/health
curl http://localhost:3000/health
```

Also check demo DB/AI status:
```powershell
curl http://localhost:5000/db-status
```

Expected (ideal):
- AI worker returns `status: ok` and models ready after startup

---

## 3) Login for demo
If using seeded/demo data, use:
- Email: `admin@test.com`
- Password: `admin123`

---

## 4) Demo flow (what to show)

1) Open dashboard
- Go to `http://localhost:3001`
- Login and confirm dashboard loads

2) Live activity
- Confirm Socket.io live updates are appearing (dashboard cards / log feed)

3) Enrollment (if the auth+enrollment path works)
- Navigate to Face Enrollment
- Enroll 1 person (camera capture or upload)
- Re-check:
  - `curl http://localhost:5000/db-status`

4) Recognition
- Use the camera client:
  - `smart-access-backend/camera-client/`
- Or trigger recognition through the backend (camera client path is recommended)

5) Sounds
- Confirm authorized vs denied audio alerts play

---

## 5) Known limitations from validation (important)

From `VALIDATION_REPORT.md`:
- Device endpoints: **NOT IMPLEMENTED** (optional advanced feature)
- Time-window access rules: **NOT IMPLEMENTED** (optional advanced feature)
- Face enrollment end-to-end test was **BLOCKED** by an authentication persistence issue

If something “optional” is missing, focus the demo on:
- Backend + AI worker health
- Live dashboard/socket streaming
- Enrollment/recognition path that works in your environment

---

## 6) Troubleshooting (only the essentials)

### A) AI worker not ready yet
- Wait for model loading (can take ~30–60 seconds)
- Re-run:
  ```powershell
  curl http://localhost:5000/health
  ```

### B) Wrong server / 404 for auth
- Auth is on backend (`3000`), not AI worker (`5000`).
- Correct login endpoint is on backend.

### C) Port conflicts
- If `3000/3001/5000` are already used, stop the process using those ports (Task Manager / netstat) and restart.

---

## 7) Status
If:
- backend `/health` responds,
- ai worker `/health` responds,
- frontend opens,

then the system is demo-ready in the sense documented by `SYSTEM_STATUS_PRODUCTION.md`.

