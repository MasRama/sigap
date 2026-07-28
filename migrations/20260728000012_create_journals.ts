export const up = `
CREATE TABLE IF NOT EXISTS journals (
  id TEXT PRIMARY KEY NOT NULL,
  schedule_id TEXT NOT NULL,
  teacher_confirmation_id TEXT NOT NULL,
  date INTEGER NOT NULL,
  material TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (schedule_id) REFERENCES schedules (id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_confirmation_id) REFERENCES teacher_confirmations (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_journals_schedule_id ON journals (schedule_id);
CREATE INDEX IF NOT EXISTS idx_journals_teacher_confirmation_id ON journals (teacher_confirmation_id);
CREATE INDEX IF NOT EXISTS idx_journals_date ON journals (date);
`;

export const down = `
DROP INDEX IF EXISTS idx_journals_date;
DROP INDEX IF EXISTS idx_journals_teacher_confirmation_id;
DROP INDEX IF EXISTS idx_journals_schedule_id;
DROP TABLE IF EXISTS journals;
`;
