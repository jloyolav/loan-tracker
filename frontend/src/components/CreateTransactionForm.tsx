import {
  Box,
  Button,
  Flex,
  Input,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import type { TransactionCreate } from "../types";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { transactionColors } from "@/utils/theme";

interface Props {
  onSubmit: (data: TransactionCreate) => void;
}

export default function CreateTransactionForm({ onSubmit }: Props) {
  const [amount, setAmount] = useState("");
  const [occurredOn, setOccurredOn] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [type, setType] = useState<"loan" | "payment">("loan");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !occurredOn) return;
    onSubmit({
      amount: parseFloat(amount),
      occurred_on: occurredOn,
      type,
      notes: notes || undefined,
    });
    setAmount("");
    setOccurredOn("");
    setType("loan");
    setNotes("");
  }

  return (
    <Box as="form" onSubmit={handleSubmit} mb={8}>
      <Text fontWeight="semibold" mb={2}>
        Add transaction
      </Text>
      <Stack gap={2}>
        <Flex gap={2}>
          <Input
            type="number"
            placeholder="Amount"
            min={0.01}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            type="date"
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
          />
        </Flex>
        <Input
          placeholder="Note (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Flex gap={2}>
          <Button
            type="button"
            flex={1}
            colorPalette={transactionColors.loan.palette}
            variant={type === "loan" ? "solid" : "outline"}
            onClick={() => setType("loan")}
            aria-label="Loan"
          >
            <GiPayMoney /> Loan
          </Button>
          <Button
            type="button"
            flex={1}
            colorPalette={transactionColors.payment.palette}
            variant={type === "payment" ? "solid" : "outline"}
            onClick={() => setType("payment")}
            aria-label="Payment"
          >
            <GiReceiveMoney /> Payment
          </Button>
          <Spacer />
          <Button type="submit" colorPalette="teal" width={"40%"}>
            Add
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
}
