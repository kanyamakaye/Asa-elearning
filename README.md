# Asa-elearning

## Running with Docker

Requires Docker and Docker Compose.

```bash
cp .env.example .env   # then fill in real values for anything beyond local use
docker compose up --build
```

This starts three services:

- **db** — Postgres 16, with data persisted in a named volume.
- **backend** — Django, served by Gunicorn behind Whitenoise (static files) at `http://localhost:8000`. Migrations run automatically on startup; uploaded media persists to `backend/media` on the host.
- **frontend** — the React app, built with Vite and served by nginx at `http://localhost:5173`.

The frontend's API base URL is baked in at build time via the `VITE_API_URL` build arg (see `.env.example`), so change it there — not at runtime — if the backend isn't reachable at `http://localhost:8000`.

To run the backend or frontend outside Docker for day-to-day development, see `backend/.env.example` and `frontend/frontend/README.md`.
