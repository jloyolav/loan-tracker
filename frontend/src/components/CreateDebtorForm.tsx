import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { useState } from "react";
import type { DebtorCreate } from "../types";

interface Props {
  onSubmit: (data: DebtorCreate) => void;
}

export default function CreateDebtorForm({ onSubmit }: Props) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed });
    setName("");
  }

  return (
    <Box as="form" onSubmit={handleSubmit} mb={8}>
      <Text fontWeight="semibold" mb={2}>
        Add debtor
      </Text>
      <Flex gap={2}>
        <Input
          placeholder="Debtor name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" colorPalette="teal">
          Add
        </Button>
      </Flex>
    </Box>
  );
}
