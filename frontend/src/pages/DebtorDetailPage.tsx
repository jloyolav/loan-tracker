import { Heading, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import CreateTransactionForm from "../components/CreateTransactionForm";
import TransactionList from "../components/TransactionList";
import type { Transaction, TransactionCreate } from "../types";

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, debtor_id: 1, amount: 5000, occurred_on: "2024-01-15", type: "loan", created_at: "2024-01-15T10:00:00Z" },
  { id: 2, debtor_id: 1, amount: 2000, occurred_on: "2024-02-01", type: "payment", created_at: "2024-02-01T10:00:00Z" },
  { id: 3, debtor_id: 1, amount: 1500, occurred_on: "2024-03-10", type: "loan", created_at: "2024-03-10T10:00:00Z" },
];

export default function DebtorDetailPage() {
  function handleCreateTransaction(data: TransactionCreate) {
    console.log("Submit transaction (mock):", data);
  }

  return (
    <>
      <Link to="/">
        <Text color="teal.600" mb={4} display="block">
          ← Back to debtors
        </Text>
      </Link>
      <Heading mb={6}>Ana García (mock)</Heading>
      <CreateTransactionForm onSubmit={handleCreateTransaction} />
      <TransactionList transactions={MOCK_TRANSACTIONS} />
    </>
  );
}
