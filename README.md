# 🚀 Fix My Itch AI

AI-powered platform for submitting everyday problems and receiving solutions.

## Architecture

- `backend/` FastAPI (API + health endpoint)
- `frontend/` React + Vite (UI)

## Local dev (Docker Compose)

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## Environment variables

Frontend reads `VITE_API_URL` at build time. By default it targets `http://localhost:8000`.

## Deploy

This repo is set up for Docker-based deployment platforms (Render/Railway/etc.).
If your host runs containers per service, deploy `backend` and `frontend` with their respective Dockerfiles:

- Backend Dockerfile: `backend/Dockerfile`
- Frontend Dockerfile: `frontend/Dockerfile`

