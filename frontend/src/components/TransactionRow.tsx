import {
  Badge,
  Box,
  Button,
  Dialog,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Portal,
  Table,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { LuCheck, LuPencil, LuTrash2, LuX } from "react-icons/lu";
import type { Transaction, TransactionUpdate } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { transactionColors } from "../utils/theme";

interface Props {
  transaction: Transaction;
  onEdit?: (data: TransactionUpdate) => void;
  onDelete?: () => void;
}

export default function TransactionRow({
  transaction,
  onEdit,
  onDelete,
}: Props) {
  const isLoan = transaction.type === "loan";
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState<TransactionUpdate>(
    {
      amount: transaction.amount,
      occurred_on: transaction.occurred_on,
      type: transaction.type,
      notes: transaction.notes,
    },
  );

  function handleEditStart() {
    // Reset to current transaction values each time editing begins,
    // so discarding changes always restores the last saved state.
    setEditedTransaction({
      amount: transaction.amount,
      occurred_on: transaction.occurred_on,
      type: transaction.type,
      notes: transaction.notes,
    });
    setEditing(true);
  }

  function handleEditCancel() {
    setEditing(false);
  }

  function handleEditSave() {
    onEdit?.(editedTransaction);
    setEditing(false);
  }

  function handleDeleteConfirmed() {
    setConfirmationDialogOpen(false);
    onDelete?.();
  }

  const editColor = isLoan
    ? transactionColors.loan.text
    : transactionColors.payment.text;

  return (
    <Table.Row>
      <Table.Cell>
        {editing ? (
          <Input
            type="date"
            size="sm"
            value={editedTransaction.occurred_on}
            onChange={(e) =>
              setEditedTransaction((prev) => ({
                ...prev,
                occurred_on: e.target.value,
              }))
            }
          />
        ) : (
          formatDate(transaction.occurred_on)
        )}
      </Table.Cell>
      <Table.Cell>
        {editing ? (
          <NativeSelect.Root size="sm">
            <NativeSelect.Field
              value={editedTransaction.type}
              onChange={(e) =>
                setEditedTransaction((prev) => ({
                  ...prev,
                  type: e.target.value as "loan" | "payment",
                }))
              }
            >
              <option value="loan">Loan</option>
              <option value="payment">Payment</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        ) : (
          <Badge
            colorPalette={
              isLoan
                ? transactionColors.loan.palette
                : transactionColors.payment.palette
            }
          >
            {isLoan ? "Loan" : "Payment"}
          </Badge>
        )}
      </Table.Cell>
      <Table.Cell>
        {editing ? (
          <Input
            size="sm"
            placeholder="Notes (optional)"
            value={editedTransaction.notes ?? ""}
            onChange={(e) =>
              setEditedTransaction((prev) => ({
                ...prev,
                notes: e.target.value || undefined,
              }))
            }
          />
        ) : (
          <Text color="fg.muted" fontSize="sm">
            {transaction.notes ?? "—"}
          </Text>
        )}
      </Table.Cell>
      <Table.Cell textAlign="right">
        {editing ? (
          <Input
            type="number"
            size="sm"
            min={0}
            textAlign="right"
            value={editedTransaction.amount}
            onChange={(e) =>
              setEditedTransaction((prev) => ({
                ...prev,
                amount: parseFloat(e.target.value) || 0,
              }))
            }
          />
        ) : (
          <Text color={editColor} fontWeight="medium">
            {isLoan ? "-" : "+"}
            {formatCurrency(transaction.amount)}
          </Text>
        )}
      </Table.Cell>
      <Table.Cell>
        <HStack justify="flex-end" gap={1}>
          {editing ? (
            <>
              <IconButton
                aria-label="Save changes"
                variant="ghost"
                size="sm"
                colorPalette="green"
                onClick={handleEditSave}
                disabled={!onEdit}
              >
                <LuCheck />
              </IconButton>
              <IconButton
                aria-label="Cancel editing"
                variant="ghost"
                size="sm"
                onClick={handleEditCancel}
              >
                <LuX />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                aria-label="Edit transaction"
                variant="ghost"
                size="sm"
                onClick={handleEditStart}
                disabled={!onEdit}
              >
                <LuPencil />
              </IconButton>
              <IconButton
                aria-label="Delete transaction"
                variant="ghost"
                size="sm"
                colorPalette="red"
                onClick={() => setConfirmationDialogOpen(true)}
                disabled={!onDelete}
              >
                <LuTrash2 />
              </IconButton>
            </>
          )}
        </HStack>

        <Dialog.Root
          role="alertdialog"
          open={confirmationDialogOpen}
          onOpenChange={(e) => setConfirmationDialogOpen(e.open)}
        >
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Delete transaction</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Text>
                    Are you sure you want to delete this transaction? This
                    action cannot be undone.
                  </Text>
                </Dialog.Body>
                <Dialog.Footer>
                  <Box display="flex" gap={3} justifyContent="flex-end">
                    <Button
                      variant="outline"
                      onClick={() => setConfirmationDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button colorPalette="red" onClick={handleDeleteConfirmed}>
                      Delete
                    </Button>
                  </Box>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Table.Cell>
    </Table.Row>
  );
}
