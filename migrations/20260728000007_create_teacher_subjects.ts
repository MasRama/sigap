export const up = `
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id TEXT PRIMARY KEY NOT NULL,
  teacher_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  academic_year_id TEXT NOT NULL,
  created_at INTEGER,
  UNIQUE (teacher_id, subject_id, academic_year_id),
  FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher_id ON teacher_subjects (teacher_id);
`;

export const down = `
DROP INDEX IF EXISTS idx_teacher_subjects_teacher_id;
DROP TABLE IF EXISTS teacher_subjects;
`;
