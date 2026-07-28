export const up = `
CREATE TABLE IF NOT EXISTS parents (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_parents_user_id ON parents (user_id);
`;

export const down = `
DROP INDEX IF EXISTS idx_parents_user_id;
DROP TABLE IF EXISTS parents;
`;
