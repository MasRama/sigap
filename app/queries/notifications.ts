import SQLite from '@services/SQLite';
import type { NotificationView } from '../types/shared';
import { randomUUID } from 'crypto';

export const createGradePublishedNotifications = (yearName: string): number => {
  const now = Date.now();
  const parentUsers = SQLite.many<{ id: string }>`
    SELECT DISTINCT u.id
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id
    WHERE r.slug = 'parent'
  `;
  for (const user of parentUsers) {
    SQLite.exec`
      INSERT INTO notifications (id, user_id, type, title, body, created_at)
      VALUES (${randomUUID()}, ${user.id}, ${'grade_published'}, ${'Nilai Dipublikasikan'}, ${`Nilai rapor tahun ajaran ${yearName} sudah dapat dilihat.`}, ${now})
    `;
  }
  return parentUsers.length;
};

export const findNotificationsByUser = (userId: string, limit: number): NotificationView[] =>
  SQLite.many<NotificationView>`
    SELECT id, type, title, body, read_at, created_at
    FROM notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

export const getUnreadNotificationCount = (userId: string): number =>
  SQLite.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_at IS NULL',
    [userId]
  )?.count ?? 0;

export const markAllNotificationsRead = (userId: string): void => {
  SQLite.run('UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL', [Date.now(), userId]);
};
