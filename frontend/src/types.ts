export interface Debtor {
  id: number;
  name: string;
  balance: number;
}

export interface DebtorCreate {
  name: string;
}

export interface Transaction {
  id: number;
  debtor_id: number;
  amount: number;
  occurred_on: string;
  type: "loan" | "payment";
  created_at: string;
  notes?: string;
}

export interface TransactionCreate {
  amount: number;
  occurred_on: string;
  type: "loan" | "payment";
  notes?: string;
}
