import SQLite from '@services/SQLite';
import type { StudentAttendance } from '@types';
import { randomUUID } from 'crypto';

export const findAllStudentAttendance = (): StudentAttendance[] =>
  SQLite.many<StudentAttendance>`SELECT * FROM student_attendance ORDER BY created_at DESC`;

export const findStudentAttendanceById = (id: string): StudentAttendance | undefined =>
  SQLite.one<StudentAttendance>`SELECT * FROM student_attendance WHERE id = ${id}`;

export const findAttendanceByJournal = (journalId: string): StudentAttendance[] =>
  SQLite.many<StudentAttendance>`SELECT * FROM student_attendance WHERE journal_id = ${journalId} ORDER BY created_at`;

export const findAttendanceByStudent = (studentId: string): StudentAttendance[] =>
  SQLite.many<StudentAttendance>`SELECT * FROM student_attendance WHERE student_id = ${studentId} ORDER BY created_at DESC`;

export const findAttendanceBySchedule = (scheduleId: string): StudentAttendance[] =>
  SQLite.many<StudentAttendance>`SELECT * FROM student_attendance WHERE schedule_id = ${scheduleId} ORDER BY created_at`;

export const createStudentAttendance = (data: Omit<StudentAttendance, 'id' | 'created_at' | 'updated_at'>): StudentAttendance => {
  const now = Date.now();
  const id = randomUUID();
  SQLite.exec`
    INSERT INTO student_attendance (id, student_id, schedule_id, journal_id, status, created_at, updated_at)
    VALUES (${id}, ${data.student_id}, ${data.schedule_id}, ${data.journal_id}, ${data.status}, ${now}, ${now})
  `;
  return findStudentAttendanceById(id)!;
};

export const upsertStudentAttendance = (data: Omit<StudentAttendance, 'id' | 'created_at' | 'updated_at'>): StudentAttendance => {
  const existing = SQLite.one<StudentAttendance>`
    SELECT * FROM student_attendance
    WHERE student_id = ${data.student_id} AND schedule_id = ${data.schedule_id} AND journal_id = ${data.journal_id}
  `;
  if (existing) {
    updateStudentAttendance(existing.id, { status: data.status });
    return findStudentAttendanceById(existing.id)!;
  }
  return createStudentAttendance(data);
};

export const updateStudentAttendance = (id: string, data: Partial<Omit<StudentAttendance, 'id' | 'created_at'>>): StudentAttendance | undefined => {
  SQLite.update('student_attendance', { id }, data);
  return findStudentAttendanceById(id);
};

export const deleteStudentAttendance = (id: string): boolean => {
  const result = SQLite.run('DELETE FROM student_attendance WHERE id = ?', [id]);
  return result.changes > 0;
};

export const deleteAttendanceByJournal = (journalId: string): number => {
  const result = SQLite.run('DELETE FROM student_attendance WHERE journal_id = ?', [journalId]);
  return result.changes;
};
