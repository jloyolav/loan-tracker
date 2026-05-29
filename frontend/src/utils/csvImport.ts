import type { Transaction, TransactionCreate } from "../types";

export type CsvImportRowStatus =
  | "ready"
  | "duplicate_existing"
  | "duplicate_in_file"
  | "invalid";

export interface CsvImportPreviewRow {
  lineNumber: number;
  status: CsvImportRowStatus;
  errorMessage?: string;
  data?: TransactionCreate;
  raw: Record<string, string>;
}

export type CsvImportPreviewResult =
  | { ok: true; rows: CsvImportPreviewRow[] }
  | { ok: false; error: string };

const REQUIRED_COLUMNS = ["amount", "occurred_on", "type"] as const;
const VALID_TYPES = new Set(["loan", "payment"]);
// Matches a string that contains only one or more digits (no decimals, positive integers)
const AMOUNT_PATTERN = /^\d+$/;

export function parseCsvText(
  text: string,
): { headers: string[]; rows: string[][] } | { error: string } {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { error: "CSV file is empty." };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  if (headers.length === 0) {
    return { error: "CSV header row is missing." };
  }

  const rows = lines.slice(1).map(parseCsvLine);
  return { headers, rows };
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current.trim());
  return fields;
}

export function parseFlexibleDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let year: number;
  let month: number;
  let day: number;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else {
    const dashMatch = /^(\d{2})-(\d{2})-(\d{4})$/.exec(trimmed);
    if (dashMatch) {
      day = Number(dashMatch[1]);
      month = Number(dashMatch[2]);
      year = Number(dashMatch[3]);
    } else {
      const slashMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
      if (!slashMatch) return null;
      day = Number(slashMatch[1]);
      month = Number(slashMatch[2]);
      year = Number(slashMatch[3]);
    }
  }

  if (!isValidCalendarDate(year, month, day)) return null;

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function isValidCalendarDate(
  year: number,
  month: number,
  day: number,
): boolean {
  if (month < 1 || month > 12 || day < 1) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function duplicateKey(data: TransactionCreate): string {
  return `${data.occurred_on}|${data.amount}|${data.type}`;
}

function rowToRecord(
  headers: string[],
  fields: string[],
): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    record[header] = fields[index] ?? "";
  });
  return record;
}

function validateRow(
  raw: Record<string, string>,
): { data: TransactionCreate } | { error: string } {
  const amountRaw = raw.amount?.trim() ?? "";
  if (!AMOUNT_PATTERN.test(amountRaw)) {
    return {
      error:
        "Invalid amount. Use plain digits only (no $, commas, or decimals).",
    };
  }

  const amount = Number(amountRaw);
  if (amount <= 0) {
    return { error: "Amount must be greater than zero." };
  }

  const occurredOn = parseFlexibleDate(raw.occurred_on ?? "");
  if (!occurredOn) {
    return {
      error: "Invalid date. Use DD-MM-YYYY, YYYY-MM-DD, or DD/MM/YYYY.",
    };
  }

  const typeRaw = (raw.type ?? "").trim().toLowerCase();
  if (!VALID_TYPES.has(typeRaw)) {
    return { error: 'Invalid type. Use "loan" or "payment".' };
  }

  const notesRaw = raw.notes?.trim() ?? "";
  const data: TransactionCreate = {
    amount,
    occurred_on: occurredOn,
    type: typeRaw as "loan" | "payment",
    notes: notesRaw || undefined,
  };

  return { data };
}

export function buildImportPreview(
  csvText: string,
  existingTransactions: Transaction[],
): CsvImportPreviewResult {
  const parsed = parseCsvText(csvText);
  if ("error" in parsed) {
    return { ok: false, error: parsed.error };
  }

  const { headers, rows } = parsed;
  console.log(headers);
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !headers.includes(col),
  );
  if (missingColumns.length > 0) {
    return {
      ok: false,
      error: `Missing required columns: ${missingColumns.join(", ")}.`,
    };
  }

  const existingKeys = new Set(
    existingTransactions.map((t) =>
      duplicateKey({
        amount: Number(t.amount),
        occurred_on: t.occurred_on,
        type: t.type,
      }),
    ),
  );

  const seenInFile = new Set<string>();
  const previewRows: CsvImportPreviewRow[] = [];

  rows.forEach((fields, index) => {
    const lineNumber = index + 2;
    const raw = rowToRecord(headers, fields);
    const validated = validateRow(raw);

    if ("error" in validated) {
      previewRows.push({
        lineNumber,
        status: "invalid",
        errorMessage: validated.error,
        raw,
      });
      return;
    }

    const { data } = validated;
    const key = duplicateKey(data);

    if (existingKeys.has(key)) {
      previewRows.push({
        lineNumber,
        status: "duplicate_existing",
        data,
        raw,
      });
      return;
    }

    if (seenInFile.has(key)) {
      previewRows.push({
        lineNumber,
        status: "duplicate_in_file",
        data,
        raw,
      });
      return;
    }

    seenInFile.add(key);
    previewRows.push({
      lineNumber,
      status: "ready",
      data,
      raw,
    });
  });

  return { ok: true, rows: previewRows };
}
