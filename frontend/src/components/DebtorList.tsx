import { Stack } from "@chakra-ui/react";
import type { Debtor } from "../types";
import DebtorCard from "./DebtorCard";

interface Props {
  debtors: Debtor[];
}

export default function DebtorList({ debtors }: Props) {
  return (
    <Stack gap={3}>
      {debtors.map((debtor) => (
        <DebtorCard key={debtor.id} debtor={debtor} />
      ))}
    </Stack>
  );
}
