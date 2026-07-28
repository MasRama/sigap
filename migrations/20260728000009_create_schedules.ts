export const up = `
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY NOT NULL,
  class_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  teacher_user_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  academic_year_id TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_schedules_class_id ON schedules (class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher_user_id ON schedules (teacher_user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day_of_week ON schedules (day_of_week);
`;

export const down = `
DROP INDEX IF EXISTS idx_schedules_day_of_week;
DROP INDEX IF EXISTS idx_schedules_teacher_user_id;
DROP INDEX IF EXISTS idx_schedules_class_id;
DROP TABLE IF EXISTS schedules;
`;
