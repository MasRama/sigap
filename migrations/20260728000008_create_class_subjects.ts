export const up = `
CREATE TABLE IF NOT EXISTS class_subjects (
  id TEXT PRIMARY KEY NOT NULL,
  class_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  teacher_id TEXT,
  academic_year_id TEXT NOT NULL,
  created_at INTEGER,
  UNIQUE (class_id, subject_id, academic_year_id),
  FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE SET NULL,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class_id ON class_subjects (class_id);
`;

export const down = `
DROP INDEX IF EXISTS idx_class_subjects_class_id;
DROP TABLE IF EXISTS class_subjects;
`;
