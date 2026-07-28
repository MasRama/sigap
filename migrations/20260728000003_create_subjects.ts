export const up = `
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects (code);
`;

export const down = `
DROP INDEX IF EXISTS idx_subjects_code;
DROP TABLE IF EXISTS subjects;
`;
