export const up = `
CREATE TABLE IF NOT EXISTS teacher_class_assignments (
  id TEXT PRIMARY KEY NOT NULL,
  teacher_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  academic_year_id TEXT NOT NULL,
  is_homeroom INTEGER NOT NULL DEFAULT 0 CHECK (is_homeroom IN (0, 1)),
  created_at INTEGER,
  UNIQUE (teacher_id, class_id, academic_year_id),
  FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_teacher_class_assignments_teacher_year
  ON teacher_class_assignments (teacher_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_teacher_class_assignments_class_year
  ON teacher_class_assignments (class_id, academic_year_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_class_assignments_one_homeroom
  ON teacher_class_assignments (class_id, academic_year_id)
  WHERE is_homeroom = 1;
`;

export const down = `
DROP INDEX IF EXISTS idx_teacher_class_assignments_one_homeroom;
DROP INDEX IF EXISTS idx_teacher_class_assignments_class_year;
DROP INDEX IF EXISTS idx_teacher_class_assignments_teacher_year;
DROP TABLE IF EXISTS teacher_class_assignments;
`;
