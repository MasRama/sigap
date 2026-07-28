export const up = `
CREATE TABLE IF NOT EXISTS teacher_confirmations (
  id TEXT PRIMARY KEY NOT NULL,
  schedule_id TEXT NOT NULL,
  teacher_user_id TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  distance_meters REAL,
  is_inside_school INTEGER DEFAULT 1,
  confirmed_at INTEGER NOT NULL,
  created_at INTEGER,
  FOREIGN KEY (schedule_id) REFERENCES schedules (id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_teacher_confirmations_schedule_id ON teacher_confirmations (schedule_id);
CREATE INDEX IF NOT EXISTS idx_teacher_confirmations_teacher_user_id ON teacher_confirmations (teacher_user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_confirmations_confirmed_at ON teacher_confirmations (confirmed_at);
`;

export const down = `
DROP INDEX IF EXISTS idx_teacher_confirmations_confirmed_at;
DROP INDEX IF EXISTS idx_teacher_confirmations_teacher_user_id;
DROP INDEX IF EXISTS idx_teacher_confirmations_schedule_id;
DROP TABLE IF EXISTS teacher_confirmations;
`;
