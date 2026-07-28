import SQLite from '@services/SQLite';
import type { Teacher, TeacherSubject } from '@types';
import { randomUUID } from 'crypto';

export const findAllTeachers = (): Teacher[] =>
  SQLite.many<Teacher>`SELECT * FROM teachers ORDER BY created_at DESC`;

export const findTeacherById = (id: string): Teacher | undefined =>
  SQLite.one<Teacher>`SELECT * FROM teachers WHERE id = ${id}`;

export const findTeacherByUserId = (userId: string): Teacher | undefined =>
  SQLite.one<Teacher>`SELECT * FROM teachers WHERE user_id = ${userId}`;

export const findTeachersBySubject = (subjectId: string): Teacher[] =>
  SQLite.many<Teacher>`
    SELECT t.* FROM teachers t
    INNER JOIN teacher_subjects ts ON t.id = ts.teacher_id
    WHERE ts.subject_id = ${subjectId}
    ORDER BY t.created_at DESC
  `;

export const getTeachersPaginated = (page: number, limit: number, search = ''): { data: Teacher[]; total: number } => {
  const pattern = `%${search.replace(/[%_]/g, '')}%`;
  const countRow = SQLite.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM teachers t
     INNER JOIN users u ON t.user_id = u.id
     WHERE u.name LIKE ? OR t.employee_id LIKE ?`,
    [pattern, pattern]
  );
  const data = SQLite.all<Teacher>(
    `SELECT t.* FROM teachers t
     INNER JOIN users u ON t.user_id = u.id
     WHERE u.name LIKE ? OR t.employee_id LIKE ?
     ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
    [pattern, pattern, limit, (page - 1) * limit]
  );
  return { data, total: countRow?.count ?? 0 };
};

export const createTeacher = (data: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>): Teacher => {
  const now = Date.now();
  const id = randomUUID();
  SQLite.exec`
    INSERT INTO teachers (id, user_id, employee_id, phone, created_at, updated_at)
    VALUES (${id}, ${data.user_id}, ${data.employee_id ?? null}, ${data.phone ?? null}, ${now}, ${now})
  `;
  return findTeacherById(id)!;
};

export const updateTeacher = (id: string, data: Partial<Omit<Teacher, 'id' | 'created_at'>>): Teacher | undefined => {
  SQLite.update('teachers', { id }, data);
  return findTeacherById(id);
};

export const deleteTeacher = (id: string): boolean => {
  const result = SQLite.run('DELETE FROM teachers WHERE id = ?', [id]);
  return result.changes > 0;
};

export const getTeacherSubjects = (teacherId: string): TeacherSubject[] =>
  SQLite.many<TeacherSubject>`SELECT * FROM teacher_subjects WHERE teacher_id = ${teacherId}`;

export const syncTeacherSubjects = (teacherId: string, subjectIds: string[], academicYearId: string): void => {
  SQLite.transaction(() => {
    SQLite.exec`DELETE FROM teacher_subjects WHERE teacher_id = ${teacherId} AND academic_year_id = ${academicYearId}`;
    const now = Date.now();
    for (const subjectId of subjectIds) {
      SQLite.exec`
        INSERT INTO teacher_subjects (id, teacher_id, subject_id, academic_year_id, created_at)
        VALUES (${randomUUID()}, ${teacherId}, ${subjectId}, ${academicYearId}, ${now})
      `;
    }
  });
};
