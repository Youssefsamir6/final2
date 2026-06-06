# TODO - Smart Access & Monitoring System (simplified)

## Completed
- [x] Fix hanging `POST /rebuild-db` in `smart-access-backend/ai-worker/app.py` (respond immediately; rebuild runs in background)
- [x] Verify integration suite passes (9/9)

## Next
1. [ ] Make “people inside campus” real (replace mock with occupancy computed from logs, or add `entry_exit` schema + backend logic)
2. [ ] Ensure demo mode disables random simulation (confirm `DEMO_SIMULATION=false` is documented/used in demo scripts)
3. [ ] Guarantee dashboard status consistency for all emitted events (`authorized/denied` and UI card logic)
4. [ ] Add a clear demo/UX indicator for “Camera capture → Decision → Dashboard update”

