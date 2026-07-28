import SQLite from '@services/SQLite';
import type { Grade } from '@types';
import { randomUUID } from 'crypto';

export const findAllGrades = (): Grade[] =>
  SQLite.many<Grade>`SELECT * FROM grades ORDER BY created_at DESC`;

export const findGradeById = (id: string): Grade | undefined =>
  SQLite.one<Grade>`SELECT * FROM grades WHERE id = ${id}`;

export const findGradesByStudent = (studentId: string): Grade[] =>
  SQLite.many<Grade>`SELECT * FROM grades WHERE student_id = ${studentId} ORDER BY date DESC`;

export const findGradesByClassSubject = (classId: string, subjectId: string): Grade[] =>
  SQLite.many<Grade>`SELECT * FROM grades WHERE class_id = ${classId} AND subject_id = ${subjectId} ORDER BY date DESC`;

export const findGradesByTeacher = (teacherUserId: string): Grade[] =>
  SQLite.many<Grade>`SELECT * FROM grades WHERE teacher_user_id = ${teacherUserId} ORDER BY date DESC`;

export const getGradesPaginated = (page: number, limit: number, studentId?: string, classId?: string, subjectId?: string): { data: Grade[]; total: number } => {
  const conditions: string[] = ['1=1'];
  const params: (string | number)[] = [];

  if (studentId) {
    conditions.push('student_id = ?');
    params.push(studentId);
  }
  if (classId) {
    conditions.push('class_id = ?');
    params.push(classId);
  }
  if (subjectId) {
    conditions.push('subject_id = ?');
    params.push(subjectId);
  }

  const where = conditions.join(' AND ');
  const countRow = SQLite.get<{ count: number }>(`SELECT COUNT(*) as count FROM grades WHERE ${where}`, params);
  const data = SQLite.all<Grade>(`SELECT * FROM grades WHERE ${where} ORDER BY date DESC LIMIT ? OFFSET ?`, [...params, limit, (page - 1) * limit]);

  return { data, total: countRow?.count ?? 0 };
};

export const createGrade = (data: Omit<Grade, 'id' | 'created_at' | 'updated_at'>): Grade => {
  const now = Date.now();
  const id = randomUUID();
  SQLite.exec`
    INSERT INTO grades (id, student_id, subject_id, class_id, type, score, date, teacher_user_id, created_at, updated_at)
    VALUES (${id}, ${data.student_id}, ${data.subject_id}, ${data.class_id}, ${data.type}, ${data.score}, ${data.date}, ${data.teacher_user_id}, ${now}, ${now})
  `;
  return findGradeById(id)!;
};

export const updateGrade = (id: string, data: Partial<Omit<Grade, 'id' | 'created_at'>>): Grade | undefined => {
  SQLite.update('grades', { id }, data);
  return findGradeById(id);
};

export const deleteGrade = (id: string): boolean => {
  const result = SQLite.run('DELETE FROM grades WHERE id = ?', [id]);
  return result.changes > 0;
};

export const deleteGrades = (ids: string[]): number => {
  if (ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(',');
  const result = SQLite.run(`DELETE FROM grades WHERE id IN (${placeholders})`, ids);
  return result.changes;
};
