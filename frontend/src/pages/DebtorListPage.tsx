import { Heading } from "@chakra-ui/react";
import { useState } from "react";
import CreateDebtorForm from "../components/CreateDebtorForm";
import DebtorList from "../components/DebtorList";
import type { Debtor, DebtorCreate } from "../types";

const MOCK_DEBTORS: Debtor[] = [
  { id: 1, name: "Ana García" },
  { id: 2, name: "Carlos López" },
  { id: 3, name: "María Rodríguez" },
];

export default function DebtorListPage() {
  const [debtors, setDebtors] = useState<Debtor[]>(MOCK_DEBTORS);

  function handleCreateDebtor(data: DebtorCreate) {
    const newDebtor: Debtor = { id: Date.now(), name: data.name };
    setDebtors((prev) => [...prev, newDebtor]);
  }

  return (
    <>
      <Heading mb={6}>Debtors</Heading>
      <CreateDebtorForm onSubmit={handleCreateDebtor} />
      <DebtorList debtors={debtors} />
    </>
  );
}
