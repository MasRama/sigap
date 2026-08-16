import SQLite from '@services/SQLite';
import type { Announcement } from '@types';
import type { AnnouncementView } from '../types/shared';
import { randomUUID } from 'crypto';

export const findAllAnnouncements = (): AnnouncementView[] =>
  SQLite.many<AnnouncementView>`
    SELECT a.id, a.title, a.body, u.name AS author_name, a.created_at
    FROM announcements a
    JOIN users u ON u.id = a.author_user_id
    ORDER BY a.created_at DESC
  `;

export const findLatestAnnouncements = (limit: number): AnnouncementView[] =>
  SQLite.many<AnnouncementView>`
    SELECT a.id, a.title, a.body, u.name AS author_name, a.created_at
    FROM announcements a
    JOIN users u ON u.id = a.author_user_id
    ORDER BY a.created_at DESC
    LIMIT ${limit}
  `;

export const findAnnouncementById = (id: string): Announcement | undefined =>
  SQLite.one<Announcement>`SELECT * FROM announcements WHERE id = ${id}`;

export const createAnnouncement = (data: { title: string; body: string; author_user_id: string }): Announcement => {
  const now = Date.now();
  const id = randomUUID();
  SQLite.exec`
    INSERT INTO announcements (id, title, body, author_user_id, created_at, updated_at)
    VALUES (${id}, ${data.title}, ${data.body}, ${data.author_user_id}, ${now}, ${now})
  `;
  return findAnnouncementById(id)!;
};

export const updateAnnouncement = (id: string, data: Partial<Pick<Announcement, 'title' | 'body'>>): Announcement | undefined => {
  SQLite.update('announcements', { id }, data);
  return findAnnouncementById(id);
};

export const deleteAnnouncement = (id: string): boolean => {
  const result = SQLite.run('DELETE FROM announcements WHERE id = ?', [id]);
  return result.changes > 0;
};
