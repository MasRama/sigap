import SQLite from '@services/SQLite';
import type { Subject } from '@types';
import { randomUUID } from 'crypto';

export const findAllSubjects = (): Subject[] =>
  SQLite.many<Subject>`SELECT * FROM subjects ORDER BY name`;

export const findSubjectById = (id: string): Subject | undefined =>
  SQLite.one<Subject>`SELECT * FROM subjects WHERE id = ${id}`;

export const findSubjectByCode = (code: string): Subject | undefined =>
  SQLite.one<Subject>`SELECT * FROM subjects WHERE code = ${code}`;

export const createSubject = (data: Omit<Subject, 'id' | 'created_at' | 'updated_at'>): Subject => {
  const now = Date.now();
  const id = randomUUID();
  SQLite.exec`
    INSERT INTO subjects (id, name, code, created_at, updated_at)
    VALUES (${id}, ${data.name}, ${data.code}, ${now}, ${now})
  `;
  return findSubjectById(id)!;
};

export const updateSubject = (id: string, data: Partial<Omit<Subject, 'id' | 'created_at'>>): Subject | undefined => {
  SQLite.update('subjects', { id }, data);
  return findSubjectById(id);
};

export const deleteSubject = (id: string): boolean => {
  const result = SQLite.run('DELETE FROM subjects WHERE id = ?', [id]);
  return result.changes > 0;
};
