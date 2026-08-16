export const up = `
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_user_id TEXT NOT NULL,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (author_user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements (created_at);
`;

export const down = `
DROP INDEX IF EXISTS idx_announcements_created;
DROP TABLE IF EXISTS announcements;
`;
