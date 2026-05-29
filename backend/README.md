# LoanTracker — Backend

This folder contains the **FastAPI** backend for LoanTracker: a small REST API over PostgreSQL to track people you lend to (**debtors**) and their **loans / payments** (**transactions**).

---

## Stack

- **Framework:** FastAPI
- **ORM:** SQLModel / SQLAlchemy
- **Database:** PostgreSQL

---

## Project layout

```text
backend/
  main.py              # ASGI entry: re-exports `app` for uvicorn
  requirements.txt
  .env_example         # Template for local env vars (copy to `.env`)
  app/
    main.py            # FastAPI app, lifespan, CORS, health routes
    config.py          # Settings from environment / `.env`
    database.py        # Engine, `get_session`, `create_db_and_tables`, DB ping
    models.py          # SQLModel: `debtor`, `loan_transaction`
    routers/
      debtors.py       # Debtor HTTP API
      transactions.py  # Nested transaction HTTP API
```

---

## Development setup

1. Create/activate a virtualenv in this directory (example: `python -m venv venv` then `source venv/bin/activate`).
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Copy `.env_example` to `.env` and adjust:
   - **`DATABASE_URL`** — e.g. `postgresql://postgres@localhost:5432/loan_tracker`
   - **`CORS_ORIGINS`** — comma-separated frontend origins

4. Run the API (from `loan-tracker/backend`):

   ```bash
   uvicorn main:app --reload
   ```

   Equivalent: `uvicorn app.main:app --reload`

5. Open **interactive API docs:** `http://127.0.0.1:8000/docs` (or your chosen host/port).

---

## Runtime behavior

- **Startup (`lifespan`):** calls `SQLModel.metadata.create_all(engine)` so missing tables are created in dev. This does **not** migrate or rename existing tables.
- **`/health`:** loads settings (fails fast if `.env` / `DATABASE_URL` is wrong).
- **`/health/db`:** runs `SELECT 1` against PostgreSQL.

---

## Implementation status

| Area                                                                         | Status |
| ---------------------------------------------------------------------------- | ------ |
| Dependencies, settings, engine, sessions                                     | Done   |
| CORS from `CORS_ORIGINS`                                                     | Done   |
| Create `debtor`, `loan_transaction` tables on DB via `create_all` on startup | Done   |
| `POST /debtors`, `GET /debtors`, `GET /debtors/{debtor_id}`                  | Done   |
| `POST/GET /debtors/{debtor_id}/transactions`                                 | Done   |
| `PUT /debtors/{debtor_id}/transactions/{transaction_id}`                     | Done   |
| `DELETE /debtors/{debtor_id}/transactions/{transaction_id}`                  | Done   |
| `notes` field on `loan_transaction`                                          | Done   |

---

## Scope

- No authentication
- No email notifications
- No advanced filtering on list endpoints

Single-tenant: all rows belong to one implicit owner until multi-user work.

---

## System use cases → backend responsibility

| Use case                    | Backend role                                                |
| --------------------------- | ----------------------------------------------------------- |
| Create debtor               | Persist `debtor`; validate `name`                           |
| List debtors                | Return all debtors                                          |
| Create transaction          | Persist row in `loan_transaction` under a valid `debtor_id` |
| List transactions by debtor | Return transactions for one `debtor_id`                     |

Balance per debtor is not a dedicated endpoint in MVP 1; derive from the transaction list if needed.

---

## Data model (PostgreSQL)

Two logical entities; physical transaction table name is **`loan_transaction`** (avoids reserved-word friction with `transaction`).

### `debtor`

| Field  | Type           | Required | Notes                                  |
| ------ | -------------- | -------- | -------------------------------------- |
| `id`   | `SERIAL`       | yes      | Primary key                            |
| `name` | `VARCHAR(255)` | yes      | Trimmed; length 1–255 (app validation) |

### `loan_transaction`

| Field         | Type                      | Required | Notes                                     |
| ------------- | ------------------------- | -------- | ----------------------------------------- |
| `id`          | `SERIAL`                  | yes      | Primary key                               |
| `debtor_id`   | `INTEGER`                 | yes      | FK → `debtor.id`, `ON DELETE CASCADE`     |
| `amount`      | `NUMERIC(12, 2)`          | yes      | `CHECK (amount > 0)`; meaning from `type` |
| `occurred_on` | `DATE`                    | yes      | Business date                             |
| `type`        | `transaction_type` (ENUM) | yes      | `loan` \| `payment`                       |
| `notes`       | `VARCHAR(500)`            | no       | Optional free-text comment                |
| `created_at`  | `TIMESTAMPTZ`             | yes      | Default `now()`                           |

### Relationships

- One debtor → many rows in `loan_transaction` (`debtor_id`).

### Future (after v0.1)

- **v0.3:** edit/delete policy (`updated_at`, soft delete, etc.).
- **v0.4:** `user_id` on tables; scope queries by user.

---

## HTTP API

### Conventions

- List endpoints return a **JSON array** where specified.

### Health & root

| Method | Path         | Purpose               |
| ------ | ------------ | --------------------- |
| `GET`  | `/`          | Service id JSON       |
| `GET`  | `/health`    | Config reachable      |
| `GET`  | `/health/db` | Database connectivity |

### Debtors (implemented)

| Method | Path                   | Body                 | Success                                                  |
| ------ | ---------------------- | -------------------- | -------------------------------------------------------- |
| `POST` | `/debtors`             | `{ "name": string }` | `201` + `{ "id", "name" }` (name trimmed; empty → `422`) |
| `GET`  | `/debtors`             | —                    | `200` + `[{ "id", "name" }, ...]`                        |
| `GET`  | `/debtors/{debtor_id}` | —                    | `200` + `{ "id", "name" }` or `404`                      |

### Transactions (implemented)

| Method   | Path                                                 | Body                                            | Success                                                                                                              |
| -------- | ---------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/debtors/{debtor_id}/transactions`                  | `{ "amount", "occurred_on", "type", "notes"? }` | `201` + `{ id, debtor_id, amount, occurred_on, type, notes, created_at }`; `404` if debtor missing; `422` if invalid |
| `GET`    | `/debtors/{debtor_id}/transactions`                  | —                                               | `200` + array of transaction objects, ordered by `occurred_on` then `created_at` ascending; `404` if debtor missing  |
| `PUT`    | `/debtors/{debtor_id}/transactions/{transaction_id}` | `{ "amount", "occurred_on", "type", "notes"? }` | `200` + updated transaction object; `404` if debtor or transaction missing; `422` if invalid                         |
| `DELETE` | `/debtors/{debtor_id}/transactions/{transaction_id}` | —                                               | `204 No Content`; `404` if debtor or transaction missing                                                             |

PostgreSQL enum `transaction_type` stores lowercase values (`loan`, `payment`); the ORM maps Python `TransactionType` accordingly.

---

## Manual testing (quick)

With the server running, from a terminal:

```bash
BASE=http://127.0.0.1:8000

curl -sS -X POST "$BASE/debtors" -H "Content-Type: application/json" \
  -d '{"name":"  Ana López  "}' -w "\nHTTP:%{http_code}\n"

curl -sS "$BASE/debtors" -w "\nHTTP:%{http_code}\n"

curl -sS "$BASE/debtors/1" -w "\nHTTP:%{http_code}\n"

curl -sS "$BASE/debtors/999999" -w "\nHTTP:%{http_code}\n"

curl -sS -X POST "$BASE/debtors/1/transactions" -H "Content-Type: application/json" \
  -d '{"amount":50,"occurred_on":"2026-04-22","type":"payment"}' -w "\nHTTP:%{http_code}\n"

curl -sS "$BASE/debtors/1/transactions" -w "\nHTTP:%{http_code}\n"
```

Use `/docs` for interactive tries and to see exact validation error bodies (`422`).

---

## Troubleshooting

- **Editor warnings** (`fastapi` import could not be resolved): point the IDE Python interpreter to this project’s `venv`.
