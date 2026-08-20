export const up = `
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at INTEGER
);
`;

export const down = `
DROP TABLE IF EXISTS app_settings;
`;
