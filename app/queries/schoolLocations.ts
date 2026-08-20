import SQLite from '@services/SQLite';
import type { SchoolLocation } from '@types';
import { randomUUID } from 'crypto';

export const findAllSchoolLocations = (): SchoolLocation[] =>
  SQLite.many<SchoolLocation>`SELECT * FROM school_locations ORDER BY is_active DESC, name`;

export const findSchoolLocationById = (id: string): SchoolLocation | undefined =>
  SQLite.one<SchoolLocation>`SELECT * FROM school_locations WHERE id = ${id}`;

export const findActiveSchoolLocation = (): SchoolLocation | undefined =>
  SQLite.one<SchoolLocation>`SELECT * FROM school_locations WHERE is_active = 1 LIMIT 1`;

export const createSchoolLocation = (data: Omit<SchoolLocation, 'id' | 'created_at'>): SchoolLocation => {
  const now = Date.now();
  const id = randomUUID();
  SQLite.exec`
    INSERT INTO school_locations (id, name, address, latitude, longitude, radius_meters, is_active, created_at)
    VALUES (${id}, ${data.name}, ${data.address ?? null}, ${data.latitude ?? null}, ${data.longitude ?? null}, ${data.radius_meters ?? null}, ${data.is_active ?? 0}, ${now})
  `;
  return findSchoolLocationById(id)!;
};

export const updateSchoolLocation = (id: string, data: Partial<Omit<SchoolLocation, 'id'>>): SchoolLocation | undefined => {
  SQLite.update('school_locations', { id }, data);
  return findSchoolLocationById(id);
};

export const deleteSchoolLocation = (id: string): boolean => {
  const result = SQLite.run('DELETE FROM school_locations WHERE id = ?', [id]);
  return result.changes > 0;
};

export const setActiveSchoolLocation = (id: string): void => {
  SQLite.transaction(() => {
    SQLite.exec`UPDATE school_locations SET is_active = 0`;
    SQLite.exec`UPDATE school_locations SET is_active = 1 WHERE id = ${id}`;
  });
};
