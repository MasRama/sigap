export const up = `
CREATE TABLE IF NOT EXISTS student_attendance (
  id TEXT PRIMARY KEY NOT NULL,
  student_id TEXT NOT NULL,
  schedule_id TEXT NOT NULL,
  journal_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER,
  UNIQUE (student_id, schedule_id, journal_id),
  FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES schedules (id) ON DELETE CASCADE,
  FOREIGN KEY (journal_id) REFERENCES journals (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_student_attendance_student_id ON student_attendance (student_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_journal_id ON student_attendance (journal_id);
`;

export const down = `
DROP INDEX IF EXISTS idx_student_attendance_journal_id;
DROP INDEX IF EXISTS idx_student_attendance_student_id;
DROP TABLE IF EXISTS student_attendance;
`;
