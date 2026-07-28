import SQLite from '@services/SQLite';

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  todayAttendance: number;
  todayJournals: number;
  pendingConfirmations: number;
}

export const getDashboardStats = (): DashboardStats => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  const totalStudents = SQLite.get<{ count: number }>('SELECT COUNT(*) as count FROM students')?.count ?? 0;
  const totalTeachers = SQLite.get<{ count: number }>('SELECT COUNT(*) as count FROM teachers')?.count ?? 0;
  const totalClasses = SQLite.get<{ count: number }>('SELECT COUNT(*) as count FROM classes')?.count ?? 0;
  const totalSubjects = SQLite.get<{ count: number }>('SELECT COUNT(*) as count FROM subjects')?.count ?? 0;
  const todayJournals = SQLite.get<{ count: number }>('SELECT COUNT(*) as count FROM journals WHERE date >= ? AND date <= ?', [startOfDay, endOfDay])?.count ?? 0;
  const todayAttendance = SQLite.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM student_attendance WHERE created_at >= ? AND created_at <= ? AND status = ?',
    [startOfDay, endOfDay, 'present']
  )?.count ?? 0;
  const pendingConfirmations = SQLite.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM schedules s WHERE NOT EXISTS (SELECT 1 FROM teacher_confirmations c WHERE c.schedule_id = s.id AND c.confirmed_at >= ? AND c.confirmed_at <= ?)',
    [startOfDay, endOfDay]
  )?.count ?? 0;

  return { totalStudents, totalTeachers, totalClasses, totalSubjects, todayAttendance, todayJournals, pendingConfirmations };
};

export interface ClassSubjectStats {
  className: string;
  subjectName: string;
  teacherName: string;
  totalStudents: number;
  averageScore: number;
}

export const getClassSubjectStats = (classId: string, subjectId: string): ClassSubjectStats => {
  const classRow = SQLite.get<{ name: string }>('SELECT name FROM classes WHERE id = ?', [classId]);
  const subjectRow = SQLite.get<{ name: string }>('SELECT name FROM subjects WHERE id = ?', [subjectId]);
  const teacherRow = SQLite.get<{ name: string }>(
    `SELECT u.name FROM class_subjects cs
     INNER JOIN teachers t ON cs.teacher_id = t.id
     INNER JOIN users u ON t.user_id = u.id
     WHERE cs.class_id = ? AND cs.subject_id = ? LIMIT 1`,
    [classId, subjectId]
  );
  const totalStudents = SQLite.get<{ count: number }>('SELECT COUNT(*) as count FROM students WHERE class_id = ?', [classId])?.count ?? 0;
  const averageRow = SQLite.get<{ average: number }>(
    'SELECT AVG(score) as average FROM grades WHERE class_id = ? AND subject_id = ?',
    [classId, subjectId]
  );

  return {
    className: classRow?.name ?? '',
    subjectName: subjectRow?.name ?? '',
    teacherName: teacherRow?.name ?? '',
    totalStudents,
    averageScore: averageRow?.average ? Math.round(averageRow.average * 100) / 100 : 0,
  };
};
