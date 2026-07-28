export const up = `
CREATE TABLE IF NOT EXISTS academic_years (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  start_at INTEGER NOT NULL,
  end_at INTEGER NOT NULL,
  is_active INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_academic_years_is_active ON academic_years (is_active);
`;

export const down = `
DROP INDEX IF EXISTS idx_academic_years_is_active;
DROP TABLE IF EXISTS academic_years;
`;
