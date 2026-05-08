# LoanTracker — Frontend

React + TypeScript + Vite + Chakra UI

---

## Running the dev server

All commands run from `frontend/`.

```bash
npm install
npm run dev
```

The app expects the backend running at `http://127.0.0.1:8000`. Copy `.env_example` to `.env` if needed:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## MVP 1 — Use Case → Frontend Map

### Routes

| Path | Page component | Use cases covered |
|---|---|---|
| `/` | `DebtorListPage` | List debtors, Create debtor |
| `/debtors/:id` | `DebtorDetailPage` | View debtor transactions, Add transaction |

---

### Component tree

```
App (Router)
├── DebtorListPage          [/]
│   ├── CreateDebtorForm    ← form: name → POST /debtors
│   └── DebtorList
│       └── DebtorCard      ← links to /debtors/:id
└── DebtorDetailPage        [/debtors/:id]
    ├── CreateTransactionForm  ← form: amount, date, type → POST /debtors/:id/transactions
    └── TransactionList
        └── TransactionRow
```

---

### Use case detail

#### List debtors
- **Route:** `/`
- **Component:** `DebtorList` → `DebtorCard`
- **API call:** `GET /debtors`
- **Behavior:** On mount, fetch all debtors and render each as a card with a link to the detail page.

#### Create debtor
- **Route:** `/` (inline form above the list)
- **Component:** `CreateDebtorForm`
- **API call:** `POST /debtors` with `{ name }`
- **Behavior:** On submit, call API, then refresh the debtor list. Clear the form on success.

#### View debtor transactions
- **Route:** `/debtors/:id`
- **Component:** `TransactionList` → `TransactionRow`
- **API call:** `GET /debtors/:id/transactions`
- **Behavior:** On mount, fetch transactions for the debtor. Display amount, date, and type per row. Sorted by `occurred_on` ascending (backend handles this).

#### Add transaction
- **Route:** `/debtors/:id` (inline form above the list)
- **Component:** `CreateTransactionForm`
- **API call:** `POST /debtors/:id/transactions` with `{ amount, occurred_on, type }`
- **Behavior:** On submit, call API, then refresh the transaction list. Clear the form on success.

---

## Explicit exclusions (MVP 1)

- No balance calculation (v0.2)
- No edit/delete transactions (v0.3)
- No auth (v0.4)
- No filtering or pagination

---

## Tech stack

| Tool | Purpose |
|---|---|
| React 18 + TypeScript | UI |
| Vite | Dev server + bundler |
| React Router | Client-side routing |
| Chakra UI | Component library |
| Axios | HTTP client for API calls |
