export const up = `
ALTER TABLE school_locations ADD COLUMN address TEXT;
ALTER TABLE school_locations RENAME TO school_locations_old;
CREATE TABLE school_locations (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  latitude REAL,
  longitude REAL,
  radius_meters INTEGER,
  is_active INTEGER DEFAULT 0,
  created_at INTEGER
);
INSERT INTO school_locations (id, name, address, latitude, longitude, radius_meters, is_active, created_at)
SELECT id, name, address, latitude, longitude, radius_meters, is_active, created_at
FROM school_locations_old;
DROP INDEX IF EXISTS idx_school_locations_is_active;
CREATE INDEX IF NOT EXISTS idx_school_locations_is_active ON school_locations (is_active);
DROP TABLE school_locations_old;
`;

export const down = `
ALTER TABLE school_locations RENAME TO school_locations_new;
CREATE TABLE school_locations (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  radius_meters INTEGER NOT NULL,
  is_active INTEGER DEFAULT 0,
  created_at INTEGER
);
INSERT INTO school_locations (id, name, latitude, longitude, radius_meters, is_active, created_at)
SELECT id, name, latitude, longitude, radius_meters, is_active, created_at
FROM school_locations_new;
DROP INDEX IF EXISTS idx_school_locations_is_active;
CREATE INDEX IF NOT EXISTS idx_school_locations_is_active ON school_locations (is_active);
DROP TABLE school_locations_new;
`;
