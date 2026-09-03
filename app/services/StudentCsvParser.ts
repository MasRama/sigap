/**
 * Pure CSV parsing for student imports. No dependencies, no DB access —
 * validated against class names and existing NIS supplied by the caller.
 */

export interface CsvStudentRow {
  nis: string;
  name: string;
  class_name: string;
  phone: string | null;
  address: string | null;
}

export interface CsvImportResult {
  rows: CsvStudentRow[];
  errors: { line: number; message: string }[];
}

const HEADER_HINT = /^\s*nis\s*,/i;

export const parseStudentCsv = (csv: string, classNames: Set<string>, existingNis: Set<string>, forcedClassName?: string): CsvImportResult => {
  const result: CsvImportResult = { rows: [], errors: [] };
  const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const cells = line.split(',').map(cell => cell.trim());
    if (index === 0 && HEADER_HINT.test(line)) return;

    const nis = cells[0] ?? '';
    const name = cells[1] ?? '';
    const className = forcedClassName ?? cells[2] ?? '';
    const phone = cells[forcedClassName ? 2 : 3]?.trim() || null;
    const address = cells[forcedClassName ? 3 : 4]?.trim() || null;
    if (!nis) {
      result.errors.push({ line: lineNumber, message: 'NIS kosong' });
      return;
    }
    if (existingNis.has(nis)) {
      result.errors.push({ line: lineNumber, message: `NIS ${nis} sudah terdaftar` });
      return;
    }
    if (!name) {
      result.errors.push({ line: lineNumber, message: 'Nama kosong' });
      return;
    }
    if (!classNames.has(className)) {
      result.errors.push({ line: lineNumber, message: `Kelas "${className}" tidak ditemukan` });
      return;
    }

    result.rows.push({ nis, name, class_name: className, phone, address });
    existingNis.add(nis);
  });

  return result;
};
