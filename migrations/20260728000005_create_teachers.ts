export const up = `
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT UNIQUE NOT NULL,
  employee_id TEXT UNIQUE,
  phone TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers (user_id);
`;

export const down = `
DROP INDEX IF EXISTS idx_teachers_user_id;
DROP TABLE IF EXISTS teachers;
`;
