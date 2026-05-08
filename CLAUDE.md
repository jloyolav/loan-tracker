# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

This project serves as a **software development portfolio and learning exercise**. Because of that, when implementing anything — a feature, a design decision, a refactor — always explain:

- **Why** this approach was chosen over alternatives
- **Which principles** apply (e.g., DRY, SRP, separation of concerns, YAGNI)
- **Any trade-offs** made (e.g., simplicity vs. flexibility, performance vs. readability)
- **What to watch out for** as the project grows

The goal is that every change is also a learning opportunity.

## Coding standards

Apply these across both backend and frontend:

- **DRY (Don't Repeat Yourself)** — extract shared logic; avoid copy-paste patterns
- **SRP (Single Responsibility Principle)** — each module, class, or function does one thing
- **Separation of concerns** — keep data fetching, business logic, and UI rendering in separate layers
- **YAGNI (You Aren't Gonna Need It)** — don't build for hypothetical futures; implement what is needed now
- **Explicit over implicit** — prefer readable, obvious code over clever one-liners
- **No dead code** — don't leave commented-out code, unused imports, or stubs behind

When a decision deviates from these principles for a good reason (performance, framework constraints, time), call it out explicitly.

## Repository layout

```
loan-tracker/
├── backend/                      # FastAPI application (Python 3.13)
│   ├── app/
│   │   ├── main.py               # FastAPI app + lifespan + CORS middleware
│   │   ├── models.py             # SQLModel table definitions (Debtor, Transaction, TransactionType)
│   │   ├── database.py           # Engine, session factory, ping + create_db_and_tables
│   │   ├── config.py             # Pydantic Settings (DATABASE_URL, CORS_ORIGINS from .env)
│   │   └── routers/
│   │       ├── debtors.py        # POST /debtors, GET /debtors, GET /debtors/{id}
│   │       └── transactions.py   # POST & GET /debtors/{id}/transactions
│   ├── main.py                   # Re-export shim — lets `uvicorn main:app` work from backend/
│   └── requirements.txt
└── frontend/                     # React 19 + Vite 8 + TypeScript
    ├── src/
    │   ├── main.tsx              # App entry point, wraps with ChakraProvider
    │   ├── App.tsx               # Root component (currently Vite default — not yet implemented)
    │   └── components/
    │       └── ui/               # Chakra UI scaffolded helpers (color-mode, provider, toaster, tooltip)
    ├── index.html
    ├── vite.config.ts
    └── .env_example              # VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Backend — running the API

All commands run from `backend/`, with `.venv` active.

```bash
pip install -r requirements.txt

# Either form works
uvicorn main:app --reload
uvicorn app.main:app --reload
```

`.env` must exist with at minimum `DATABASE_URL`:

```
DATABASE_URL=postgresql://postgres@localhost:5432/loan_tracker
CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173   # optional, this is the default
```

Tables are created automatically on startup via `SQLModel.metadata.create_all`. No migration tool is wired up yet.

Health check endpoints: `GET /health` (validates config), `GET /health/db` (pings the database).

## Frontend — running the dev server

```bash
cd frontend
npm install
npm run dev        # starts at http://localhost:5173
```

Key dependencies:
- **Chakra UI v3** — component library with dark/light mode via `next-themes`
- **React Router v7** — client-side routing
- **Axios** — HTTP client for API calls
- **React Icons** — icon library

## Data model

Two tables. Balance is derived, not stored.

- **`debtor`** — `id` (PK), `name` VARCHAR(255, not null)
- **`loan_transaction`** — `id`, `debtor_id` (FK → debtor, CASCADE DELETE), `amount` NUMERIC(12,2) CHECK > 0, `occurred_on` DATE, `type` ENUM(`loan`|`payment`), `created_at` TIMESTAMPTZ

`Transaction` maps to the physical table `loan_transaction` to avoid collisions with reserved SQL words.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service root |
| GET | `/health` | Config health check |
| GET | `/health/db` | Database ping |
| POST | `/debtors` | Create debtor |
| GET | `/debtors` | List all debtors |
| GET | `/debtors/{debtor_id}` | Get single debtor |
| POST | `/debtors/{debtor_id}/transactions` | Create transaction |
| GET | `/debtors/{debtor_id}/transactions` | List transactions for a debtor |

## API conventions

- Plural resource URLs: `/debtors`
- Transactions nested under their debtor: `/debtors/{debtor_id}/transactions`
- List endpoints return a JSON array directly (not wrapped)
- Sort transactions by `occurred_on` ASC, `created_at` ASC
- 404 on `debtor_id` not found for both debtor and transaction endpoints

## Schema classes (in routers)

- `DebtorCreate` / `DebtorRead` — in `routers/debtors.py`
- `TransactionCreate` / `TransactionRead` — in `routers/transactions.py`

## Frontend development methodology

Build the UI incrementally so every step produces something visible and verifiable in the browser before moving to the next one:

1. **UI first, API second** — implement each component with hardcoded mock data, verify it looks and behaves correctly, then replace the mock with the real API call.
2. **One component per step** — don't implement two components at once; complete and verify each before starting the next.
3. **Mock data is temporary** — mock data exists only until the real API connection is implemented in that same component. Remove it when wiring up; don't leave both coexisting.
4. **Each step must be browser-verifiable** — after every step, the app should render without errors and show the new UI change. If a step produces no visible output, it's too granular or should be combined with the next.
5. **No API calls before the service layer exists** — create `src/services/api.ts` (with all typed API functions) before connecting any component to the backend.

## MVP 1 scope (explicit exclusions)

No auth, no edit/delete on transactions (`PATCH`/`DELETE` unimplemented), no query-param filtering, single-tenant (no `user_id`).
