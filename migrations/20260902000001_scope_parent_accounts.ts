import type SQLiteType from '../app/services/SQLite';

type ParentUser = { id: string };
type StudentNis = { nis: string };
type UsernameRow = { id: string; username: string };

const PARENT_READ_PERMISSIONS = ['students.view', 'grades.view', 'attendance.view'];

export function up(SQLite: typeof SQLiteType): void {
  const parentRole = SQLite.get<{ id: string }>('SELECT id FROM roles WHERE slug = ?', ['parent']);
  if (parentRole) {
    for (const permissionSlug of PARENT_READ_PERMISSIONS) {
      const permission = SQLite.get<{ id: string }>('SELECT id FROM permissions WHERE slug = ?', [permissionSlug]);
      if (!permission) continue;
      SQLite.run(
        'DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [parentRole.id, permission.id],
      );
    }
  }

  const parentUsers = SQLite.all<ParentUser>(`
    SELECT DISTINCT u.id
    FROM users u
    INNER JOIN user_roles ur ON ur.user_id = u.id
    INNER JOIN roles r ON r.id = ur.role_id
    WHERE r.slug = 'parent'
  `);
  const parentUserIds = new Set(parentUsers.map(user => user.id));

  for (const user of parentUsers) {
    SQLite.run(
      'UPDATE users SET username = ? WHERE id = ?',
      [`__parent_username_migration_${user.id}`, user.id],
    );
  }

  const usedUsernames = new Set(
    SQLite.all<UsernameRow>('SELECT id, username FROM users')
      .filter(user => !parentUserIds.has(user.id))
      .map(user => user.username.toLowerCase()),
  );

  for (const user of parentUsers) {
    const linkedStudents = SQLite.all<StudentNis>(
      'SELECT nis FROM students WHERE parent_user_id = ? ORDER BY nis',
      [user.id],
    );
    const loginNis = linkedStudents
      .map(student => student.nis.toLowerCase())
      .find(nis => !usedUsernames.has(nis));

    if (!loginNis) {
      throw new Error(`Parent account ${user.id} has no available linked-student NIS username`);
    }

    SQLite.run(
      'UPDATE users SET username = ?, updated_at = ? WHERE id = ?',
      [loginNis, Date.now(), user.id],
    );
    usedUsernames.add(loginNis);
  }
}
