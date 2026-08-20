import SQLite from '@services/SQLite';
import type { Grade } from '@types';
import type { GradeSummaryRow, SubjectGradeSummary, GradeSummaryComponent, ClassSubjectSummary } from '../types/shared';
import { computeFinalScore, predikatOf, isPassed } from '@services/GradeCalculator';
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

export const getGradesPaginated = (
  page: number,
  limit: number,
  studentId?: string,
  classId?: string,
  subjectId?: string,
  teacherUserId?: string,
): { data: Grade[]; total: number } => {
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
  if (teacherUserId) {
    conditions.push(`class_id IN (
      SELECT tca.class_id
      FROM teacher_class_assignments tca
      INNER JOIN teachers t ON t.id = tca.teacher_id
      INNER JOIN classes c ON c.id = tca.class_id AND c.academic_year_id = tca.academic_year_id
      WHERE t.user_id = ?
    )`);
    params.push(teacherUserId);
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

const findComponentsByYear = (academicYearId: string): GradeSummaryComponent[] =>
  SQLite.many<GradeSummaryComponent>`
    SELECT type, name, weight FROM grade_components WHERE academic_year_id = ${academicYearId} ORDER BY weight DESC, type
  `;

export const getGradesPublicationForStudent = (studentId: string): boolean => {
  const row = SQLite.get<{ published: number }>(
    `SELECT ay.is_grades_published AS published
     FROM students st
     JOIN classes c ON c.id = st.class_id
     JOIN academic_years ay ON ay.id = c.academic_year_id
     WHERE st.id = ?`,
    [studentId]
  );
  return (row?.published ?? 0) === 1;
};

export const getClassSubjectSummary = (classId: string, subjectId: string): ClassSubjectSummary | null => {
  const meta = SQLite.get<{ className: string; subjectName: string; kkm: number; yearId: string }>(
    `SELECT c.name AS className, s.name AS subjectName, s.kkm AS kkm, c.academic_year_id AS yearId
     FROM classes c
     JOIN subjects s ON s.id = ?
     WHERE c.id = ?`,
    [subjectId, classId]
  );
  if (!meta) return null;

  const gradeRows = SQLite.all<{ student_id: string; student_name: string; nis: string; type: string; score: number }>(
    `SELECT g.student_id, st.name AS student_name, st.nis, g.type, g.score
     FROM grades g
     JOIN students st ON st.id = g.student_id
     WHERE g.class_id = ? AND g.subject_id = ?
     ORDER BY st.name`,
    [classId, subjectId]
  );

  const byStudent = new Map<string, { student_id: string; student_name: string; nis: string; scores: Record<string, number | null> }>();
  for (const row of gradeRows) {
    let entry = byStudent.get(row.student_id);
    if (!entry) {
      entry = { student_id: row.student_id, student_name: row.student_name, nis: row.nis, scores: {} };
      byStudent.set(row.student_id, entry);
    }
    entry.scores[row.type] = row.score;
  }

  const components = findComponentsByYear(meta.yearId);
  const rows: GradeSummaryRow[] = [...byStudent.values()].map(entry => {
    const finalScore = computeFinalScore(entry.scores, components);
    return {
      student_id: entry.student_id,
      student_name: entry.student_name,
      nis: entry.nis,
      scores: entry.scores,
      final_score: finalScore,
      kkm: meta.kkm,
      predikat: predikatOf(finalScore, meta.kkm),
      is_passed: isPassed(finalScore, meta.kkm),
    };
  });

  return { className: meta.className, subjectName: meta.subjectName, kkm: meta.kkm, components, rows };
};

export const getStudentGradeSummaries = (studentId: string): { published: boolean; summaries: SubjectGradeSummary[] } => {  const published = getGradesPublicationForStudent(studentId);

  const meta = SQLite.get<{ yearId: string }>(
    `SELECT c.academic_year_id AS yearId FROM students st JOIN classes c ON c.id = st.class_id WHERE st.id = ?`,
    [studentId]
  );
  if (!meta) return { published, summaries: [] };

  const gradeRows = SQLite.all<{ subject_id: string; subject_name: string; kkm: number; type: string; score: number }>(
    `SELECT g.subject_id, s.name AS subject_name, s.kkm AS kkm, g.type, g.score
     FROM grades g
     JOIN subjects s ON s.id = g.subject_id
     WHERE g.student_id = ?
     ORDER BY s.name`,
    [studentId]
  );

  const components = findComponentsByYear(meta.yearId);
  const bySubject = new Map<string, SubjectGradeSummary>();
  for (const row of gradeRows) {
    let entry = bySubject.get(row.subject_id);
    if (!entry) {
      entry = {
        subject_id: row.subject_id,
        subject_name: row.subject_name,
        kkm: row.kkm,
        scores: {},
        final_score: null,
        predikat: null,
        is_passed: null,
      };
      bySubject.set(row.subject_id, entry);
    }
    entry.scores[row.type] = row.score;
  }
  for (const entry of bySubject.values()) {
    entry.final_score = computeFinalScore(entry.scores, components);
    entry.predikat = predikatOf(entry.final_score, entry.kkm);
    entry.is_passed = isPassed(entry.final_score, entry.kkm);
  }

  return { published, summaries: [...bySubject.values()] };
};

export const getStudentContext = (studentId: string): { class_name: string; year_name: string } | null => {
  const row = SQLite.get<{ class_name: string; year_name: string }>(
    `SELECT c.name AS class_name, ay.name AS year_name
     FROM students st
     JOIN classes c ON c.id = st.class_id
     JOIN academic_years ay ON ay.id = c.academic_year_id
     WHERE st.id = ?`,
    [studentId]
  );
  return row ?? null;
};
