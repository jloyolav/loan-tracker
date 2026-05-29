import {
  Badge,
  Box,
  Button,
  Dialog,
  Portal,
  Spinner,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import type { Transaction, TransactionCreate } from "../types";
import { formatCurrency, formatDate } from "../utils";
import {
  buildImportPreview,
  type CsvImportPreviewRow,
} from "../utils/csvImport";
import { errorColors, transactionColors } from "@/theme";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingTransactions: Transaction[];
  onImport: (rows: TransactionCreate[]) => Promise<void>;
}

const STATUS_LABELS: Record<CsvImportPreviewRow["status"], string> = {
  ready: "Ready",
  duplicate_existing: "Duplicate (existing)",
  duplicate_in_file: "Duplicate (in file)",
  invalid: "Invalid",
};

const STATUS_PALETTES: Record<CsvImportPreviewRow["status"], string> = {
  ready: "green",
  duplicate_existing: "orange",
  duplicate_in_file: "yellow",
  invalid: "red",
};

export default function CsvImportDialog({
  open,
  onOpenChange,
  existingTransactions,
  onImport,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewRows, setPreviewRows] = useState<CsvImportPreviewRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const readyCount = previewRows.filter((row) => row.status === "ready").length;
  const duplicateCount = previewRows.filter(
    (row) =>
      row.status === "duplicate_existing" || row.status === "duplicate_in_file",
  ).length;
  const invalidCount = previewRows.filter((row) => row.status === "invalid").length;

  function resetState() {
    setPreviewRows([]);
    setParseError(null);
    setImportError(null);
    setSelectedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isImporting) {
      resetState();
    }
    if (!isImporting) {
      onOpenChange(nextOpen);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setImportError(null);
    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const result = buildImportPreview(text, existingTransactions);
      if ("error" in result) {
        setPreviewRows([]);
        setParseError(result.error);
        return;
      }
      setPreviewRows(result.rows);
    };
    reader.onerror = () => {
      setPreviewRows([]);
      setParseError("Failed to read the file. Please try again.");
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    const rowsToImport = previewRows
      .filter((row) => row.status === "ready" && row.data)
      .map((row) => row.data!);

    if (rowsToImport.length === 0) return;

    setIsImporting(true);
    setImportError(null);
    try {
      await onImport(rowsToImport);
      resetState();
      onOpenChange(false);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Import failed. Please try again.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  function renderDate(row: CsvImportPreviewRow) {
    if (row.data?.occurred_on) {
      return formatDate(row.data.occurred_on);
    }
    return row.raw.occurred_on?.trim() || "—";
  }

  function renderType(row: CsvImportPreviewRow) {
    const type = row.data?.type ?? row.raw.type?.trim().toLowerCase();
    if (type !== "loan" && type !== "payment") {
      return (
        <Text color="fg.muted" fontSize="sm">
          {row.raw.type?.trim() || "—"}
        </Text>
      );
    }

    const isLoan = type === "loan";
    return (
      <Badge
        colorPalette={
          isLoan ? transactionColors.loan.palette : transactionColors.payment.palette
        }
      >
        {isLoan ? "Loan" : "Payment"}
      </Badge>
    );
  }

  function renderAmount(row: CsvImportPreviewRow) {
    if (row.data) {
      return formatCurrency(row.data.amount);
    }
    return row.raw.amount?.trim() || "—";
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => handleOpenChange(e.open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="4xl">
            <Dialog.Header>
              <Dialog.Title>Import transactions from CSV</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Text fontSize="sm" color="fg.muted">
                  Required columns:{" "}
                  <strong>amount</strong>, <strong>occurred_on</strong>,{" "}
                  <strong>type</strong>. Optional: <strong>notes</strong>.
                  Amount must be plain digits (e.g. 50000). Dates: DD-MM-YYYY,
                  YYYY-MM-DD, or DD/MM/YYYY.
                </Text>

                <Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    disabled={isImporting}
                  />
                  {selectedFileName && (
                    <Text fontSize="sm" mt={1} color="fg.muted">
                      Selected: {selectedFileName}
                    </Text>
                  )}
                </Box>

                {parseError && (
                  <Text color={errorColors.text} fontSize="sm">
                    {parseError}
                  </Text>
                )}

                {importError && (
                  <Text color={errorColors.text} fontSize="sm">
                    {importError}
                  </Text>
                )}

                {previewRows.length > 0 && (
                  <>
                    <Text fontSize="sm">
                      {readyCount} ready to import, {duplicateCount} duplicate
                      {duplicateCount === 1 ? "" : "s"}, {invalidCount} invalid
                    </Text>

                    <Box maxH="320px" overflowY="auto">
                      <Table.Root variant="outline" size="sm">
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeader>Line</Table.ColumnHeader>
                            <Table.ColumnHeader>Date</Table.ColumnHeader>
                            <Table.ColumnHeader>Type</Table.ColumnHeader>
                            <Table.ColumnHeader>Notes</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="right">
                              Amount
                            </Table.ColumnHeader>
                            <Table.ColumnHeader>Status</Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {previewRows.map((row) => (
                            <Table.Row key={row.lineNumber}>
                              <Table.Cell>{row.lineNumber}</Table.Cell>
                              <Table.Cell>{renderDate(row)}</Table.Cell>
                              <Table.Cell>{renderType(row)}</Table.Cell>
                              <Table.Cell>
                                <Text color="fg.muted" fontSize="sm">
                                  {row.data?.notes ??
                                    (row.raw.notes?.trim() || "—")}
                                </Text>
                              </Table.Cell>
                              <Table.Cell textAlign="right">
                                {renderAmount(row)}
                              </Table.Cell>
                              <Table.Cell>
                                <Stack gap={1}>
                                  <Badge colorPalette={STATUS_PALETTES[row.status]}>
                                    {STATUS_LABELS[row.status]}
                                  </Badge>
                                  {row.errorMessage && (
                                    <Text fontSize="xs" color={errorColors.text}>
                                      {row.errorMessage}
                                    </Text>
                                  )}
                                </Stack>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table.Root>
                    </Box>
                  </>
                )}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Box display="flex" gap={3} justifyContent="flex-end" alignItems="center">
                {isImporting && <Spinner size="sm" />}
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button
                  colorPalette="teal"
                  onClick={handleImport}
                  disabled={readyCount === 0 || isImporting}
                >
                  Import {readyCount} transaction{readyCount === 1 ? "" : "s"}
                </Button>
              </Box>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
