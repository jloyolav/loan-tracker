Start the LoanTracker development environment (backend + frontend).

## Steps

1. Start the **backend** in the background:
   - Working directory: `backend/`
   - Activate virtualenv: `source .venv/bin/activate`
   - Command: `uvicorn main:app --reload`
   - Run it in the background using `run_in_background: true`
   - Wait a couple seconds, then check it's responding on `http://127.0.0.1:8000/health`

2. Start the **frontend** in the background:
   - Working directory: `frontend/`
   - Command: `pnpm dev`
   - Run it in the background using `run_in_background: true`
   - Wait a couple seconds, then confirm it started (check output mentions localhost:5173)

3. Report to the user:
   - Backend URL: http://127.0.0.1:8000
   - Frontend URL: http://localhost:5173
   - Any errors encountered during startup

## Notes
- If the backend fails to start, check that PostgreSQL is running and `.env` exists in `backend/` with `DATABASE_URL`.
- If the frontend fails to start, check that dependencies are installed (`pnpm install` in `frontend/`).
- Do not open a browser automatically unless asked.
