import SQLite from '@services/SQLite';
import type { Student } from '@types';
import { randomUUID } from 'crypto';

export const findAllStudents = (): Student[] =>
  SQLite.many<Student>`SELECT * FROM students ORDER BY name`;

export const findStudentById = (id: string): Student | undefined =>
  SQLite.one<Student>`SELECT * FROM students WHERE id = ${id}`;

export const findStudentsByClass = (classId: string): Student[] =>
  SQLite.many<Student>`SELECT * FROM students WHERE class_id = ${classId} ORDER BY name`;

export const findStudentsByParent = (parentUserId: string): Student[] =>
  SQLite.many<Student>`SELECT * FROM students WHERE parent_user_id = ${parentUserId} ORDER BY name`;

export const searchStudents = (search: string, classId?: string): Student[] => {
  const pattern = `%${search.replace(/[%_]/g, '')}%`;
  const classClause = classId ? 'AND class_id = ?' : '';
  const params = classId ? [pattern, pattern, classId] : [pattern, pattern];
  return SQLite.all<Student>(
    `SELECT * FROM students WHERE (nis LIKE ? OR name LIKE ?) ${classClause} ORDER BY name`,
    params
  );
};

export const getStudentsPaginated = (page: number, limit: number, search = '', classId?: string): { data: Student[]; total: number } => {
  const pattern = `%${search.replace(/[%_]/g, '')}%`;
  const classClause = classId ? 'AND class_id = ?' : '';
  const countParams = classId ? [pattern, pattern, classId] : [pattern, pattern];
  const dataParams = classId ? [pattern, pattern, classId, limit, (page - 1) * limit] : [pattern, pattern, limit, (page - 1) * limit];

  const countRow = SQLite.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM students WHERE (nis LIKE ? OR name LIKE ?) ${classClause}`,
    countParams
  );

  const data = SQLite.all<Student>(
    `SELECT * FROM students WHERE (nis LIKE ? OR name LIKE ?) ${classClause} ORDER BY name LIMIT ? OFFSET ?`,
    dataParams
  );

  return { data, total: countRow?.count ?? 0 };
};

export const createStudent = (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Student => {
  const now = Date.now();
  const id = randomUUID();
  SQLite.exec`
    INSERT INTO students (id, nis, name, class_id, parent_user_id, phone, address, created_at, updated_at)
    VALUES (${id}, ${data.nis}, ${data.name}, ${data.class_id}, ${data.parent_user_id ?? null}, ${data.phone ?? null}, ${data.address ?? null}, ${now}, ${now})
  `;
  return findStudentById(id)!;
};

export const updateStudent = (id: string, data: Partial<Omit<Student, 'id' | 'created_at'>>): Student | undefined => {
  SQLite.update('students', { id }, data);
  return findStudentById(id);
};

export const deleteStudent = (id: string): boolean => {
  const result = SQLite.run('DELETE FROM students WHERE id = ?', [id]);
  return result.changes > 0;
};

export const deleteStudents = (ids: string[]): number => {
  if (ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(',');
  const result = SQLite.run(`DELETE FROM students WHERE id IN (${placeholders})`, ids);
  return result.changes;
};
