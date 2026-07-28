export const up = `
CREATE TABLE IF NOT EXISTS grades (
  id TEXT PRIMARY KEY NOT NULL,
  student_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  type TEXT NOT NULL,
  score REAL NOT NULL,
  date INTEGER NOT NULL,
  teacher_user_id TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER,
  UNIQUE (student_id, subject_id, class_id, type),
  FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades (student_id);
CREATE INDEX IF NOT EXISTS idx_grades_class_subject ON grades (class_id, subject_id);
`;

export const down = `
DROP INDEX IF EXISTS idx_grades_class_subject;
DROP INDEX IF EXISTS idx_grades_student_id;
DROP TABLE IF EXISTS grades;
`;
