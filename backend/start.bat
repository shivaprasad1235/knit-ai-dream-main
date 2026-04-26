@echo off
REM Start the backend server with auto-reload (Windows)

echo Starting Loop Bloom API...
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
