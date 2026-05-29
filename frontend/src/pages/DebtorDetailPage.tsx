import { Button, Flex, Heading, Spacer, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CreateTransactionForm from "../components/CreateTransactionForm";
import CsvImportDialog from "../components/CsvImportDialog";
import TransactionList from "../components/TransactionList";
import {
  createTransaction,
  deleteTransaction,
  getDebtor,
  getTransactions,
  updateTransaction,
} from "../services/api";
import type { Debtor, Transaction, TransactionCreate, TransactionUpdate } from "../types";
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
  const [csvImportOpen, setCsvImportOpen] = useState(false);

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

  async function handleDeleteTransaction(transaction: Transaction) {
    try {
      await deleteTransaction(debtorId, transaction.id);
      setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));

      // recover the total balance from API
      const updatedDebtor = await getDebtor(debtorId);
      setDebtor(updatedDebtor);
    } catch {
      setFormError("Failed to delete transaction. Please try again.");
    }
  }

  async function handleCsvImport(rows: TransactionCreate[]) {
    let successCount = 0;
    let failureCount = 0;

    for (const row of rows) {
      try {
        await createTransaction(debtorId, row);
        successCount++;
      } catch {
        failureCount++;
      }
    }

    const [debtorData, transactionsData] = await Promise.all([
      getDebtor(debtorId),
      getTransactions(debtorId),
    ]);
    setDebtor(debtorData);
    setTransactions(transactionsData);

    if (failureCount > 0) {
      throw new Error(
        `Imported ${successCount} of ${rows.length}. ${failureCount} failed.`,
      );
    }

    setFormError(null);
  }

  async function handleUpdateTransaction(
    transaction: Transaction,
    data: TransactionUpdate,
  ) {
    try {
      // Persist the changes to the backend; receives the full updated transaction
      const updatedTransaction = await updateTransaction(
        debtorId,
        transaction.id,
        data,
      );

      // Replace the old transaction and re-sort by occurred_on so the list
      // stays ordered even if the date was changed
      setTransactions((prev) => {
        const replaced = prev.map((t) =>
          t.id === transaction.id ? updatedTransaction : t,
        );
        return replaced.sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));
      });

      // Re-fetch the debtor to get the updated balance, since amount or type may have changed
      const updatedDebtor = await getDebtor(debtorId);
      setDebtor(updatedDebtor);

      setFormError(null);
    } catch {
      setFormError("Failed to update transaction. Please try again.");
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
          {/** Header: name, total balance */}
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

          <Flex justify="flex-end" mb={2}>
            <Button
              variant="outline"
              colorPalette="teal"
              onClick={() => setCsvImportOpen(true)}
            >
              Import CSV
            </Button>
          </Flex>

          <CreateTransactionForm onSubmit={handleCreateTransaction} />

          <CsvImportDialog
            open={csvImportOpen}
            onOpenChange={setCsvImportOpen}
            existingTransactions={transactions}
            onImport={handleCsvImport}
          />

          {formError && (
            <Text color={errorColors.text} mb={4}>
              {formError}
            </Text>
          )}

          {/** Transaction list */}
          {transactions.length > 0 ? (
            <TransactionList
              transactions={transactions}
              onEdit={handleUpdateTransaction}
              onDelete={handleDeleteTransaction}
            />
          ) : (
            <Text>No transactions found</Text>
          )}
        </>
      )}
    </>
  );
}
