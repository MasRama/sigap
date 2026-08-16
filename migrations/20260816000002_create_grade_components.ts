export const up = `
CREATE TABLE IF NOT EXISTS grade_components (
  id TEXT PRIMARY KEY NOT NULL,
  academic_year_id TEXT NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER,
  UNIQUE (academic_year_id, type),
  FOREIGN KEY (academic_year_id) REFERENCES academic_years (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_grade_components_year ON grade_components (academic_year_id);
`;

export const down = `
DROP INDEX IF EXISTS idx_grade_components_year;
DROP TABLE IF EXISTS grade_components;
`;
