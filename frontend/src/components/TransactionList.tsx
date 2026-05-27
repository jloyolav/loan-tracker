import { Table } from "@chakra-ui/react";
import type { Transaction, TransactionUpdate } from "../types";
import TransactionRow from "./TransactionRow";

interface Props {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction, data: TransactionUpdate) => void;
  onDelete?: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, onEdit, onDelete }: Props) {
  return (
    <Table.Root variant="outline">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Date</Table.ColumnHeader>
          <Table.ColumnHeader>Type</Table.ColumnHeader>
          <Table.ColumnHeader>Notes</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="right">Amount</Table.ColumnHeader>
          <Table.ColumnHeader />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {transactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            onEdit={onEdit ? (data) => onEdit(transaction, data) : undefined}
            onDelete={onDelete ? () => onDelete(transaction) : undefined}
          />
        ))}
      </Table.Body>
    </Table.Root>
  );
}
