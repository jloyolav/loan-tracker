import { Badge, Table, Text } from "@chakra-ui/react";
import type { Transaction } from "../types";
import { formatCurrency, formatDate } from "../utils";
import { transactionColors } from "../theme";

interface Props {
  transaction: Transaction;
}

export default function TransactionRow({ transaction }: Props) {
  const isLoan = transaction.type === "loan";

  return (
    <Table.Row>
      <Table.Cell>{formatDate(transaction.occurred_on)}</Table.Cell>
      <Table.Cell>
        <Badge
          colorPalette={
            isLoan
              ? transactionColors.loan.palette
              : transactionColors.payment.palette
          }
        >
          {isLoan ? "Loan" : "Payment"}
        </Badge>
      </Table.Cell>
      <Table.Cell>
        <Text color="fg.muted" fontSize="sm">
          {transaction.notes ?? "—"}
        </Text>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Text
          color={
            isLoan
              ? transactionColors.loan.text
              : transactionColors.payment.text
          }
          fontWeight="medium"
        >
          {isLoan ? "-" : "+"}
          {formatCurrency(transaction.amount)}
        </Text>
      </Table.Cell>
    </Table.Row>
  );
}
