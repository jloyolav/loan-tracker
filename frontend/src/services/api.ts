import axios from "axios";
import type { Debtor, DebtorCreate, Transaction, TransactionCreate } from "../types";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000",
});

export async function getDebtors(): Promise<Debtor[]> {
  const { data } = await client.get("/debtors");
  return data;
}

export async function createDebtor(payload: DebtorCreate): Promise<Debtor> {
  const { data } = await client.post("/debtors", payload);
  return data;
}

export async function getDebtor(id: number): Promise<Debtor> {
  const { data } = await client.get(`/debtors/${id}`);
  return data;
}

export async function getTransactions(debtorId: number): Promise<Transaction[]> {
  const { data } = await client.get(`/debtors/${debtorId}/transactions`);
  return data.map((t: Transaction) => ({ ...t, amount: Number(t.amount) }));
}

export async function createTransaction(
  debtorId: number,
  payload: TransactionCreate
): Promise<Transaction> {
  const { data } = await client.post(`/debtors/${debtorId}/transactions`, payload);
  return { ...data, amount: Number(data.amount) };
}
