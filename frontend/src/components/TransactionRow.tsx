import { Badge, Table, Text } from "@chakra-ui/react";
import type { Transaction } from "../types";
import { formatCurrency } from "../utils";

interface Props {
  transaction: Transaction;
}

export default function TransactionRow({ transaction }: Props) {
  const isLoan = transaction.type === "loan";

  return (
    <Table.Row>
      <Table.Cell>{transaction.occurred_on}</Table.Cell>
      <Table.Cell>
        <Badge colorPalette={isLoan ? "red" : "green"}>
          {isLoan ? "Loan" : "Payment"}
        </Badge>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Text color={isLoan ? "red.600" : "green.600"} fontWeight="medium">
          {isLoan ? "-" : "+"}
          {formatCurrency(transaction.amount)}
        </Text>
      </Table.Cell>
    </Table.Row>
  );
}
