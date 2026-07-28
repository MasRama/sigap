export const up = `
CREATE TABLE IF NOT EXISTS school_locations (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  radius_meters INTEGER NOT NULL,
  is_active INTEGER DEFAULT 0,
  created_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_school_locations_is_active ON school_locations (is_active);
`;

export const down = `
DROP INDEX IF EXISTS idx_school_locations_is_active;
DROP TABLE IF EXISTS school_locations;
`;
