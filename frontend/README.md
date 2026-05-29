# LoanTracker — Frontend

React + TypeScript + Vite + Chakra UI

---

## Running the dev server

All commands run from `frontend/`.

```bash
pnpm install
pnpm dev
```

The app expects the backend running at `http://127.0.0.1:8000`. Copy `.env_example` to `.env` if needed:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## Use Case → Frontend Map

### Routes

| Path | Page component | Use cases covered |
|---|---|---|
| `/` | `DebtorListPage` | List debtors, Create debtor |
| `/debtors/:id` | `DebtorDetailPage` | View transactions, balance, add/edit/delete/import |

---

### Component tree

```
App (Router)
├── DebtorListPage              [/]
│   ├── CreateDebtorForm        ← form: name → POST /debtors
│   └── DebtorList
│       └── DebtorCard          ← shows balance, links to /debtors/:id
└── DebtorDetailPage            [/debtors/:id]
    ├── CreateTransactionForm   ← form: amount, date, type, notes → POST
    ├── CsvImportDialog         ← parse CSV, preview rows, bulk import
    └── TransactionList
        └── TransactionRow      ← inline editing (edit/delete per row)
```

---

### Utils

```
src/utils/
  api.ts         ← all typed API functions (moved to services/)
  csvImport.ts   ← CSV parsing, validation, duplicate detection, preview builder
  format.ts      ← currency and date formatting helpers
  theme.ts       ← design tokens (colors)
```

---

### Use case detail

#### List debtors
- **Route:** `/`
- **Component:** `DebtorList` → `DebtorCard`
- **API call:** `GET /debtors`
- **Behavior:** On mount, fetch all debtors; each card shows current balance and links to the detail page.

#### Create debtor
- **Route:** `/` (inline form above the list)
- **Component:** `CreateDebtorForm`
- **API call:** `POST /debtors` with `{ name }`
- **Behavior:** On submit, call API, refresh list, clear form.

#### View debtor transactions
- **Route:** `/debtors/:id`
- **Component:** `TransactionList` → `TransactionRow`
- **API call:** `GET /debtors/:id/transactions`
- **Behavior:** Fetch transactions on mount; display amount, date, type, and optional notes per row. Sorted by `occurred_on` ascending (backend).

#### Add transaction
- **Route:** `/debtors/:id` (inline form above the list)
- **Component:** `CreateTransactionForm`
- **API call:** `POST /debtors/:id/transactions` with `{ amount, occurred_on, type, notes? }`
- **Behavior:** On submit, call API, refresh list, clear form.

#### Edit transaction
- **Component:** `TransactionRow` (inline editing mode)
- **API call:** `PUT /debtors/:id/transactions/:txId`
- **Behavior:** Clicking the edit icon turns the row into editable inputs. Save calls PUT; cancel discards changes.

#### Delete transaction
- **Component:** `TransactionRow`
- **API call:** `DELETE /debtors/:id/transactions/:txId`
- **Behavior:** Confirmation dialog before calling API; row removed from list on success.

#### Import transactions from CSV
- **Component:** `CsvImportDialog`
- **API call:** `POST /debtors/:id/transactions` (one call per valid row)
- **Behavior:** User selects a CSV file; the dialog parses it client-side, shows a preview with status per row (`ready`, `duplicate_existing`, `duplicate_in_file`, `invalid`), and imports only the `ready` rows on confirm.
- **CSV format:** Required columns: `amount`, `occurred_on`, `type`. Optional: `notes`. Dates accepted as `YYYY-MM-DD`, `DD-MM-YYYY`, or `DD/MM/YYYY`.

---

## Explicit exclusions

- No auth
- No filtering or pagination

---

## Tech stack

| Tool | Purpose |
|---|---|
| React 19 + TypeScript | UI |
| Vite 6 | Dev server + bundler |
| React Router v7 | Client-side routing |
| Chakra UI v3 | Component library (with `next-themes` for color mode) |
| Axios | HTTP client for API calls |
| React Icons | Icon library |
| pnpm | Package manager |
