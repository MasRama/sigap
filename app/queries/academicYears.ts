import SQLite from '@services/SQLite';
import type { AcademicYear } from '@types';
import { randomUUID } from 'crypto';

export const findAllAcademicYears = (): AcademicYear[] =>
  SQLite.many<AcademicYear>`SELECT * FROM academic_years ORDER BY start_at DESC`;

export const findAcademicYearById = (id: string): AcademicYear | undefined =>
  SQLite.one<AcademicYear>`SELECT * FROM academic_years WHERE id = ${id}`;

export const findActiveAcademicYear = (): AcademicYear | undefined =>
  SQLite.one<AcademicYear>`SELECT * FROM academic_years WHERE is_active = 1 LIMIT 1`;

export const createAcademicYear = (data: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>): AcademicYear => {
  const now = Date.now();
  const id = randomUUID();
  SQLite.exec`
    INSERT INTO academic_years (id, name, start_at, end_at, is_active, created_at, updated_at)
    VALUES (${id}, ${data.name}, ${data.start_at}, ${data.end_at}, ${data.is_active ?? 0}, ${now}, ${now})
  `;
  return findAcademicYearById(id)!;
};

export const updateAcademicYear = (id: string, data: Partial<Omit<AcademicYear, 'id' | 'created_at'>>): AcademicYear | undefined => {
  SQLite.update('academic_years', { id }, data);
  return findAcademicYearById(id);
};

export const deleteAcademicYear = (id: string): boolean => {
  const result = SQLite.run('DELETE FROM academic_years WHERE id = ?', [id]);
  return result.changes > 0;
};

export const setActiveAcademicYear = (id: string): void => {
  SQLite.transaction(() => {
    SQLite.exec`UPDATE academic_years SET is_active = 0`;
    SQLite.exec`UPDATE academic_years SET is_active = 1, updated_at = ${Date.now()} WHERE id = ${id}`;
  });
};
