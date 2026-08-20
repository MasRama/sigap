export const up = `
ALTER TABLE teacher_confirmations RENAME TO teacher_confirmations_old;
CREATE TABLE teacher_confirmations (
  id TEXT PRIMARY KEY NOT NULL,
  schedule_id TEXT,
  teacher_user_id TEXT NOT NULL,
  photo_url TEXT,
  latitude REAL,
  longitude REAL,
  distance_meters REAL,
  is_inside_school INTEGER DEFAULT 1,
  confirmation_date INTEGER,
  confirmed_at INTEGER NOT NULL,
  created_at INTEGER,
  FOREIGN KEY (schedule_id) REFERENCES schedules (id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_user_id) REFERENCES users (id) ON DELETE CASCADE
);
INSERT INTO teacher_confirmations (id, schedule_id, teacher_user_id, photo_url, latitude, longitude, distance_meters, is_inside_school, confirmed_at, created_at)
SELECT id, schedule_id, teacher_user_id, photo_url, latitude, longitude, distance_meters, is_inside_school, confirmed_at, created_at
FROM teacher_confirmations_old;
DROP INDEX IF EXISTS idx_teacher_confirmations_schedule_id;
DROP INDEX IF EXISTS idx_teacher_confirmations_teacher_user_id;
DROP INDEX IF EXISTS idx_teacher_confirmations_confirmed_at;
CREATE INDEX IF NOT EXISTS idx_teacher_confirmations_schedule_id ON teacher_confirmations (schedule_id);
CREATE INDEX IF NOT EXISTS idx_teacher_confirmations_teacher_user_id ON teacher_confirmations (teacher_user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_confirmations_confirmed_at ON teacher_confirmations (confirmed_at);
CREATE INDEX IF NOT EXISTS idx_teacher_confirmations_confirmation_date ON teacher_confirmations (teacher_user_id, confirmation_date);
DROP TABLE teacher_confirmations_old;
`;

export const down = `
ALTER TABLE teacher_confirmations RENAME TO teacher_confirmations_new;
CREATE TABLE teacher_confirmations (
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
INSERT INTO teacher_confirmations (id, schedule_id, teacher_user_id, photo_url, latitude, longitude, distance_meters, is_inside_school, confirmed_at, created_at)
SELECT id, schedule_id, teacher_user_id, photo_url, latitude, longitude, distance_meters, is_inside_school, confirmed_at, created_at
FROM teacher_confirmations_new;
DROP INDEX IF EXISTS idx_teacher_confirmations_schedule_id;
DROP INDEX IF EXISTS idx_teacher_confirmations_teacher_user_id;
DROP INDEX IF EXISTS idx_teacher_confirmations_confirmed_at;
CREATE INDEX IF NOT EXISTS idx_teacher_confirmations_schedule_id ON teacher_confirmations (schedule_id);
CREATE INDEX IF NOT EXISTS idx_teacher_confirmations_teacher_user_id ON teacher_confirmations (teacher_user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_confirmations_confirmed_at ON teacher_confirmations (confirmed_at);
DROP TABLE teacher_confirmations_new;
`;
