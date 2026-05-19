import { Flex, Heading, Spacer, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CreateTransactionForm from "../components/CreateTransactionForm";
import TransactionList from "../components/TransactionList";
import { createTransaction, getDebtor, getTransactions } from "../services/api";
import type { Debtor, Transaction, TransactionCreate } from "../types";
import { formatCurrency } from "../utils";
import { balanceColors, errorColors } from "@/theme";

export default function DebtorDetailPage() {
  // Get the debtor ID from the URL with useParams (from react-router-dom)
  const { id } = useParams();
  const debtorId = Number(id);

  const [debtor, setDebtor] = useState<Debtor | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // This effect fetches the debtor and transactions from the API and sets the state
  useEffect(() => {
    //Parallel API calls
    Promise.all([getDebtor(debtorId), getTransactions(debtorId)])
      .then(([debtorData, transactionsData]) => {
        setDebtor(debtorData);
        setTransactions(transactionsData);
      })
      .catch((error) => setError(error.message))
      .finally(() => setIsLoading(false));
  }, [debtorId]);

  async function handleCreateTransaction(data: TransactionCreate) {
    try {
      const newTransaction = await createTransaction(debtorId, data);
      setTransactions((prev) => {
        if (prev.length === 0) return [newTransaction];
        if (newTransaction.occurred_on < prev[0].occurred_on)
          return [newTransaction, ...prev];
        if (newTransaction.occurred_on >= prev[prev.length - 1].occurred_on)
          return [...prev, newTransaction];
        const idx = prev.findIndex(
          (t) => t.occurred_on > newTransaction.occurred_on,
        );
        return [...prev.slice(0, idx), newTransaction, ...prev.slice(idx)];
      });
      setFormError(null);
    } catch {
      setFormError("Failed to add transaction. Please try again.");
    }
  }

  return (
    <>
      <Link to="/">
        <Text color="teal.600" mb={4} display="block">
          ← Back to debtors
        </Text>
      </Link>
      {isLoading ? (
        <Spinner />
      ) : error || !debtor ? (
        <Text color={errorColors.text}>{error ?? "Debtor not found"}</Text>
      ) : (
        <>
          <Flex mb={6}>
            <Heading>{debtor.name}</Heading>
            <Spacer />
            <Text fontWeight="semibold" mr={2}>
              Total Balance:
            </Text>
            <Text
              fontWeight="semibold"
              color={
                debtor.balance >= 0
                  ? balanceColors.positive
                  : balanceColors.negative
              }
            >
              {formatCurrency(debtor.balance)}
            </Text>
          </Flex>

          <CreateTransactionForm onSubmit={handleCreateTransaction} />
          {formError && (
            <Text color={errorColors.text} mb={4}>
              {formError}
            </Text>
          )}
          {transactions.length > 0 ? (
            <TransactionList transactions={transactions} />
          ) : (
            <Text>No transactions found</Text>
          )}
        </>
      )}
    </>
  );
}
