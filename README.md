# Event Vendor Budgeting & Booking Platform

A platform that connects users planning events (marriage, birthday, corporate) with event vendors,
built around a smart, real-time budget allocation system.

## Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion + TanStack Query + Zustand
- **Backend**: Python FastAPI + SQLAlchemy + Alembic + JWT auth
- **Database**: PostgreSQL

## Modules

- **Auth** — username/password signup & login with JWT access/refresh tokens (OTP verification planned for a later phase)
- **Events** — create events (Marriage/Birthday/Corporate) with date, location, total budget
- **Budget Allocation** — auto-generated categories per event type, drag-and-drop allocation, real-time totals, over-budget alerts
- **Vendor Search** — filter by budget/rating/location, view packages/photos/reviews, wishlist
- **Vendor Dashboard** — booking management, availability calendar, quotations, khatabook-style ledger & invoices
- **Admin** — vendor approval, category & commission management, reports
- **Payments** — UI-only placeholder for now; gateway integration is a future enhancement

## Getting started

### With Docker (recommended)

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs

### Without Docker

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then edit DATABASE_URL to point at your local Postgres
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

## Project structure

See `frontend/src` and `backend/app` for the layered structure (api → services → repositories → models on the
backend; features → components on the frontend).
