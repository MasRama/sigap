import type SQLiteType from '../app/services/SQLite';

type UserRow = { id: string; username: string };

const normalizeUsername = (legacyValue: string, userId: string): string => {
  const localPart = legacyValue.split('@')[0] ?? legacyValue;
  const normalized = localPart
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')
    .slice(0, 40);

  return normalized.length >= 3
    ? normalized
    : `user_${userId.replace(/-/g, '').slice(0, 8)}`;
};

export function up(SQLite: typeof SQLiteType): void {
  SQLite.raw().exec('ALTER TABLE users RENAME COLUMN email TO username');

  const users = SQLite.all<UserRow>('SELECT id, username FROM users');
  const usedUsernames = new Set<string>();

  for (const user of users) {
    SQLite.run('UPDATE users SET username = ? WHERE id = ?', [`__username_migration_${user.id}`, user.id]);
  }

  for (const user of users) {
    const base = normalizeUsername(user.username, user.id);
    let username = base;
    let suffix = 2;

    while (usedUsernames.has(username)) {
      username = `${base.slice(0, 45 - String(suffix).length)}_${suffix}`;
      suffix += 1;
    }

    usedUsernames.add(username);
    SQLite.run('UPDATE users SET username = ?, updated_at = ? WHERE id = ?', [username, Date.now(), user.id]);
  }
}

export function down(SQLite: typeof SQLiteType): void {
  SQLite.raw().exec('ALTER TABLE users RENAME COLUMN username TO email');
}
