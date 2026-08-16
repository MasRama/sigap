export const up = `
CREATE TABLE IF NOT EXISTS grade_audit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  grade_id TEXT,
  student_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  type TEXT NOT NULL,
  action TEXT NOT NULL,
  old_score REAL,
  new_score REAL,
  user_id TEXT NOT NULL,
  created_at INTEGER,
  FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_grade_audit_logs_grade ON grade_audit_logs (grade_id);
CREATE INDEX IF NOT EXISTS idx_grade_audit_logs_created ON grade_audit_logs (created_at);
`;

export const down = `
DROP INDEX IF EXISTS idx_grade_audit_logs_created;
DROP INDEX IF EXISTS idx_grade_audit_logs_grade;
DROP TABLE IF EXISTS grade_audit_logs;
`;
