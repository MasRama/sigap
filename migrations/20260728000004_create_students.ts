export const up = `
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY NOT NULL,
  nis TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  parent_user_id TEXT,
  phone TEXT,
  address TEXT,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
  FOREIGN KEY (parent_user_id) REFERENCES users (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students (class_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_user_id ON students (parent_user_id);
`;

export const down = `
DROP INDEX IF EXISTS idx_students_parent_user_id;
DROP INDEX IF EXISTS idx_students_class_id;
DROP TABLE IF EXISTS students;
`;
