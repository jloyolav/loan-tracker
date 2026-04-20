# LoanTracker — Backend (design notes)

This document captures **Phase 2 — Lightweight Design** outcomes for the backend: scope, data model, and HTTP API. It mirrors [`+README Dev Guide.md`](+README%20Dev%20Guide.md) as the source of truth until Phase 3 implementation exists.

---

## Stack (target)

- **Framework:** FastAPI
- **ORM:** SQLModel / SQLAlchemy
- **Database:** PostgreSQL

---

## MVP 1 scope (backend-relevant)

Explicit exclusions for this version:

- No authentication
- No email notifications
- No editing or deleting transactions (no `PATCH` / `DELETE` on transactions)
- No advanced filtering (no query params on list endpoints)

Single-tenant: all rows belong to one implicit “owner” until multi-user work (e.g. v0.4).

---

## System use cases → backend responsibility

| Use case                    | Backend role                                    |
| --------------------------- | ----------------------------------------------- |
| Create debtor               | Persist `debtor`; validate `name`               |
| List debtors                | Return all debtors                              |
| Create transaction          | Persist `transaction` under a valid `debtor_id` |
| List transactions by debtor | Return transactions for one `debtor_id`         |

User-facing “balance per person” is not a dedicated API in MVP 1; consumers may derive it from the transaction list (UI emphasis in v0.2).

---

## Data model (PostgreSQL)

Two tables for MVP 1. Balance is **derived**, not stored.

### `debtor`

| Field  | Type           | Required | Notes                            |
| ------ | -------------- | -------- | -------------------------------- |
| `id`   | `BIGSERIAL`    | yes      | Primary key                      |
| `name` | `VARCHAR(255)` | yes      | Trimmed; length 1–255 (app + DB) |

### `transaction`

| Field         | Type                      | Required | Notes                                  |
| ------------- | ------------------------- | -------- | -------------------------------------- |
| `id`          | `BIGSERIAL`               | yes      | Primary key                            |
| `debtor_id`   | `BIGINT`                  | yes      | FK → `debtor.id`, `ON DELETE CASCADE`  |
| `amount`      | `NUMERIC(12, 2)`          | yes      | `CHECK (amount > 0)`; sign from `type` |
| `occurred_on` | `DATE`                    | yes      | Business date of loan/payment          |
| `type`        | `transaction_type` (ENUM) | yes      | `loan` \| `payment`                    |
| `created_at`  | `TIMESTAMPTZ`             | yes      | Default `now()`                        |

### Relationships

- One **debtor** → many **transactions** (`transaction.debtor_id`).

### Future (not MVP 1)

- **v0.3:** edit/delete policy (`updated_at`, soft delete, etc.).
- **v0.4:** `user_id` on both tables; scope every query by user.

### Design notes

- One table + `type` for loans and payments (shared columns).
- Money as `NUMERIC(12,2)` — avoid floats for currency.

---

## HTTP API (MVP 1)

### Conventions

- Plural resources: `/debtors`.
- Nested transactions: `/debtors/{debtor_id}/transactions` (path owns `debtor_id`; do not duplicate in body on create).
- JSON names align with columns (`occurred_on`, `type`, …).
- List endpoints return a **JSON array** of objects.

### Endpoints

#### `POST /debtors`

- **Body:** `{ "name": string }`
- **Response:** `{ "id": number, "name": string }`
- **Status:** `201 Created`; `422` / `400` on validation error

#### `GET /debtors`

- **Response:** `[ { "id", "name" }, ... ]`
- **Status:** `200 OK`

#### `GET /debtors/{debtor_id}`

- **Response:** `{ "id", "name" }`
- **Status:** `200 OK`; `404` if missing

#### `POST /debtors/{debtor_id}/transactions`

- **Body:** `{ "amount": number, "occurred_on": "YYYY-MM-DD", "type": "loan" | "payment" }`
- **Response:** `{ "id", "debtor_id", "amount", "occurred_on", "type", "created_at" }` (`created_at` ISO-8601)
- **Status:** `201 Created`; `404` if debtor missing; `422` on invalid payload

#### `GET /debtors/{debtor_id}/transactions`

- **Response:** array of transaction objects (same shape as create response)
- **Sort (recommended):** `occurred_on` ASC, then `created_at` ASC
- **Status:** `200 OK`; `404` if debtor missing
