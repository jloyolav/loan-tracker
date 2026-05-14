import { Heading, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import CreateDebtorForm from "../components/CreateDebtorForm";
import DebtorList from "../components/DebtorList";
import { createDebtor, getDebtors } from "../services/api";
import type { Debtor, DebtorCreate } from "../types";

export default function DebtorListPage() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    getDebtors()
      .then(setDebtors)
      .catch(() => setError("Failed to fetch debtors"))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreateDebtor(data: DebtorCreate) {
    try {
      const newDebtor = await createDebtor(data);
      setDebtors((prev) => [...prev, newDebtor]);
      setFormError(null);
    } catch {
      setFormError("Failed to add debtor. Please try again.");
    }
  }

  return (
    <>
      {error && (
        <Text color="red.500" mb={4}>
          {error}
        </Text>
      )}
      <Heading mb={6}>Debtors</Heading>
      <CreateDebtorForm onSubmit={handleCreateDebtor} />
      {formError && (
        <Text color="red.500" mb={4}>
          {formError}
        </Text>
      )}
      {isLoading ? <Spinner /> : <DebtorList debtors={debtors} />}
    </>
  );
}
