import { describe, it, expect } from 'vitest';
import { parseStudentCsv } from '../../app/services/StudentCsvParser';

const freshSets = () => ({ classNames: new Set(['10A', '10B']), existingNis: new Set(['10001']) });

describe('parseStudentCsv', () => {
  it('parses valid rows and skips a header line', () => {
    const { classNames, existingNis } = freshSets();
    const csv = 'nis,name,class,phone,address\n10011,Andi Saputra,10A,0812,Jl. Melati\n10012,Budi Hartono,10B,,';
    const result = parseStudentCsv(csv, classNames, existingNis);

    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([
      { nis: '10011', name: 'Andi Saputra', class_name: '10A', phone: '0812', address: 'Jl. Melati' },
      { nis: '10012', name: 'Budi Hartono', class_name: '10B', phone: null, address: null },
    ]);
  });

  it('rejects duplicate NIS within the file', () => {
    const { classNames, existingNis } = freshSets();
    const csv = '10011,A,10A,\n10011,B,10B,';
    const result = parseStudentCsv(csv, classNames, existingNis);

    expect(result.rows).toHaveLength(1);
    expect(result.errors).toEqual([{ line: 2, message: 'NIS 10011 sudah terdaftar' }]);
  });

  it('rejects NIS that already exists in the database', () => {
    const { classNames, existingNis } = freshSets();
    const result = parseStudentCsv('10001,Dup,10A,', classNames, existingNis);
    expect(result.errors).toEqual([{ line: 1, message: 'NIS 10001 sudah terdaftar' }]);
    expect(result.rows).toEqual([]);
  });

  it('rejects empty NIS and empty name', () => {
    const { classNames, existingNis } = freshSets();
    const result = parseStudentCsv(',Tanpa Nis,10A,\n10013,,10A,', classNames, existingNis);
    expect(result.errors).toEqual([
      { line: 1, message: 'NIS kosong' },
      { line: 2, message: 'Nama kosong' },
    ]);
  });

  it('rejects unknown class names', () => {
    const { classNames, existingNis } = freshSets();
    const result = parseStudentCsv('10013,Ani,11Z,', classNames, existingNis);
    expect(result.errors).toEqual([{ line: 1, message: 'Kelas "11Z" tidak ditemukan' }]);
  });

  it('ignores blank lines', () => {
    const { classNames, existingNis } = freshSets();
    const result = parseStudentCsv('10013,Ani,10A,\n\n10014,Budi,10B,', classNames, existingNis);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(2);
  });
});
