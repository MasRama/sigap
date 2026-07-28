export const up = `
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  academic_year_id TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year_id ON classes (academic_year_id);
`;

export const down = `
DROP INDEX IF EXISTS idx_classes_academic_year_id;
DROP TABLE IF EXISTS classes;
`;
