import SQLite from '@services/SQLite';
import type { SessionStatusView, JournalCompletenessView, GradeProgressView, OutsideConfirmationView } from '../types/shared';

export type SessionStatus = SessionStatusView;
export type JournalCompletenessRow = JournalCompletenessView;
export type GradeProgressRow = GradeProgressView;
export type OutsideConfirmationRow = OutsideConfirmationView;

const startOfDay = (date: Date): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

interface ScheduleTemplate {
  id: string;
  day_of_week: number;
  start_time: number;
  end_time: number;
  class_name: string;
  subject_name: string;
  teacher_name: string;
  teacher_user_id: string;
}

const findActiveYearSchedules = (): ScheduleTemplate[] =>
  SQLite.many<ScheduleTemplate>`
    SELECT sch.id, sch.day_of_week, sch.start_time, sch.end_time, sch.teacher_user_id,
           c.name AS class_name, sub.name AS subject_name, u.name AS teacher_name
    FROM schedules sch
    JOIN classes c ON c.id = sch.class_id
    JOIN subjects sub ON sub.id = sch.subject_id
    JOIN users u ON u.id = sch.teacher_user_id
    JOIN academic_years ay ON ay.id = sch.academic_year_id
    WHERE ay.is_active = 1
  `;

const occurrencesBetween = (template: ScheduleTemplate, from: number, to: number): number[] => {
  const occurrences: number[] = [];
  const fromDate = new Date(from);
  fromDate.setHours(0, 0, 0, 0);
  const toDate = new Date(to);
  toDate.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;

  for (let t = fromDate.getTime(); t <= toDate.getTime(); t += dayMs) {
    const d = new Date(t);
    if (d.getDay() === template.day_of_week) {
      const occurrence = new Date(t);
      const start = new Date(template.start_time);
      occurrence.setHours(start.getHours(), start.getMinutes(), 0, 0);
      occurrences.push(occurrence.getTime());
    }
  }
  return occurrences;
};

const sessionStatus = (template: ScheduleTemplate, occurrenceStart: number, occurrenceEnd: number): SessionStatus => {
  const confirmed = !!SQLite.get<{ id: string }>(
    'SELECT id FROM teacher_confirmations WHERE schedule_id = ? AND confirmed_at >= ? AND confirmed_at <= ? LIMIT 1',
    [template.id, occurrenceStart, occurrenceEnd]
  );
  const hasJournal = !!SQLite.get<{ id: string }>(
    'SELECT id FROM journals WHERE schedule_id = ? AND date >= ? AND date <= ? LIMIT 1',
    [template.id, occurrenceStart, occurrenceEnd]
  );
  return {
    schedule_id: template.id,
    class_name: template.class_name,
    subject_name: template.subject_name,
    teacher_name: template.teacher_name,
    start_time: occurrenceStart,
    end_time: occurrenceEnd,
    confirmed,
    has_journal: hasJournal,
  };
};

export const getTodaySessions = (): SessionStatus[] => {
  const now = new Date();
  const dow = now.getDay();
  const todayStart = startOfDay(now);
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;

  return findActiveYearSchedules()
    .filter(s => s.day_of_week === dow)
    .map(s => sessionStatus(s, todayStart, todayEnd));
};

export const getMissedSessions = (): SessionStatus[] => {
  const now = Date.now();
  const from = startOfDay(new Date(now)) - 7 * 24 * 60 * 60 * 1000;

  const missed: SessionStatus[] = [];
  for (const template of findActiveYearSchedules()) {
    for (const occurrenceStart of occurrencesBetween(template, from, now)) {
      const occurrenceEnd = occurrenceStart + (template.end_time - template.start_time);
      if (occurrenceEnd > now) continue;
      const status = sessionStatus(template, occurrenceStart, occurrenceEnd);
      if (!status.confirmed) missed.push(status);
    }
  }
  return missed.sort((a, b) => a.start_time - b.start_time);
};

export const getJournalCompleteness = (): JournalCompletenessRow[] => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
  const from = monthStart;
  const to = now.getTime();

  const rows = SQLite.many<{ teacher_user_id: string; teacher_name: string }>`
    SELECT DISTINCT sch.teacher_user_id, u.name AS teacher_name
    FROM schedules sch
    JOIN users u ON u.id = sch.teacher_user_id
    JOIN academic_years ay ON ay.id = sch.academic_year_id
    WHERE ay.is_active = 1
  `;

  const templates = findActiveYearSchedules();
  return rows.map(row => {
    const teacherTemplates = templates.filter(t => t.teacher_user_id === row.teacher_user_id);
    const expected = teacherTemplates.reduce(
      (sum, t) => sum + occurrencesBetween(t, from, to).filter(occ => occ <= now.getTime()).length,
      0
    );
    const filled = SQLite.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM journals j JOIN schedules sch ON sch.id = j.schedule_id WHERE sch.teacher_user_id = ? AND j.date >= ? AND j.date <= ?',
      [row.teacher_user_id, from, to]
    )?.count ?? 0;
    return { teacher_name: row.teacher_name, expected, filled };
  });
};

export const getGradeProgress = (): GradeProgressRow[] =>
  SQLite.many<GradeProgressRow>`
    SELECT c.name AS class_name, sub.name AS subject_name, u.name AS teacher_name,
           (SELECT COUNT(*) FROM students st WHERE st.class_id = cs.class_id) AS total_students,
           (SELECT COUNT(DISTINCT g.student_id) FROM grades g WHERE g.class_id = cs.class_id AND g.subject_id = cs.subject_id) AS graded_students
    FROM class_subjects cs
    JOIN classes c ON c.id = cs.class_id
    JOIN subjects sub ON sub.id = cs.subject_id
    LEFT JOIN teachers t ON t.id = cs.teacher_id
    LEFT JOIN users u ON u.id = t.user_id
    JOIN academic_years ay ON ay.id = cs.academic_year_id
    WHERE ay.is_active = 1
    ORDER BY c.name, sub.name
  `;

export const getOutsideConfirmations = (): OutsideConfirmationRow[] =>
  SQLite.many<OutsideConfirmationRow>`
    SELECT sch.id AS schedule_id, c.name AS class_name, sub.name AS subject_name, u.name AS teacher_name,
           tc.distance_meters, tc.confirmed_at
    FROM teacher_confirmations tc
    JOIN schedules sch ON sch.id = tc.schedule_id
    JOIN classes c ON c.id = sch.class_id
    JOIN subjects sub ON sub.id = sch.subject_id
    JOIN users u ON u.id = tc.teacher_user_id
    WHERE tc.is_inside_school = 0
    ORDER BY tc.confirmed_at DESC
  `;
