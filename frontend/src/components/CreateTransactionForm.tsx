import {
  Box,
  Button,
  Flex,
  Input,
  NativeSelect,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import type { TransactionCreate } from "../types";

interface Props {
  onSubmit: (data: TransactionCreate) => void;
}

export default function CreateTransactionForm({ onSubmit }: Props) {
  const [amount, setAmount] = useState("");
  const [occurredOn, setOccurredOn] = useState("");
  const [type, setType] = useState<"loan" | "payment">("loan");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !occurredOn) return;
    onSubmit({ amount: parseFloat(amount), occurred_on: occurredOn, type });
    setAmount("");
    setOccurredOn("");
    setType("loan");
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
        <Flex gap={2}>
          <NativeSelect.Root flex={1}>
            <NativeSelect.Field
              value={type}
              onChange={(e) => setType(e.target.value as "loan" | "payment")}
            >
              <option value="loan">Loan</option>
              <option value="payment">Payment</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
          <Button type="submit" colorPalette="teal">
            Add
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
}
