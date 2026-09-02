import type SQLiteType from '../app/services/SQLite';
import { randomUUID } from 'crypto';

export function run(SQLite: typeof SQLiteType): void {
  const now = Date.now();
  const roles = [
    { name: 'Admin', slug: 'admin', description: 'Operator pengelola data dan konfigurasi sekolah' },
    { name: 'Kepala Sekolah', slug: 'headmaster', description: 'Pengawasan sekolah dan laporan' },
    { name: 'Guru', slug: 'teacher', description: 'Mengajar, jurnal, presensi, dan penilaian kelas' },
    { name: 'Orang Tua', slug: 'parent', description: 'Melihat data anak, kehadiran, dan nilai' },
  ];

  for (const role of roles) {
    SQLite.run(
      'INSERT OR IGNORE INTO roles (id, name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [randomUUID(), role.name, role.slug, role.description, now, now]
    );
    SQLite.run(
      'UPDATE roles SET name = ?, description = ?, updated_at = ? WHERE slug = ?',
      [role.name, role.description, now, role.slug]
    );
  }

  const getPerm = (slug: string): string | undefined =>
    SQLite.get<{ id: string }>('SELECT id FROM permissions WHERE slug = ?', [slug])?.id;

  const rolePermissions: Record<string, string[]> = {
    admin: [
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'settings.view', 'settings.edit',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
      'academic_years.view', 'academic_years.create', 'academic_years.edit', 'academic_years.delete',
      'classes.view', 'classes.create', 'classes.edit', 'classes.delete',
      'subjects.view', 'subjects.create', 'subjects.edit', 'subjects.delete',
      'students.view', 'students.create', 'students.edit', 'students.delete',
      'teachers.view', 'teachers.create', 'teachers.edit', 'teachers.delete',
      'parents.view', 'parents.create', 'parents.edit', 'parents.delete',
      'schedules.view', 'schedules.create', 'schedules.edit', 'schedules.delete',
      'school_locations.view', 'school_locations.create', 'school_locations.edit', 'school_locations.delete',
      'confirmations.view',
      'qr_settings.view', 'qr_settings.edit',
    ],
    headmaster: [
      'academic_years.view',
      'classes.view',
      'subjects.view',
      'students.view',
      'teachers.view',
      'parents.view',
      'schedules.view',
      'school_locations.view',
      'confirmations.view',
      'journals.view',
      'grades.view', 'grades.audit',
      'attendance.view',
      'headmaster.view',
    ],
    teacher: [
      'students.view',
      'teachers.view',
      'schedules.view',
      'school_locations.view',
      'confirmations.create', 'confirmations.view',
      'journals.view', 'journals.create', 'journals.edit',
      'grades.view', 'grades.create', 'grades.edit',
      'attendance.view', 'attendance.create', 'attendance.edit',
    ],
    parent: [],
  };

  for (const [roleSlug, permissionSlugs] of Object.entries(rolePermissions)) {
    const role = SQLite.get<{ id: string }>('SELECT id FROM roles WHERE slug = ?', [roleSlug]);
    if (!role) continue;

    SQLite.run('DELETE FROM role_permissions WHERE role_id = ?', [role.id]);
    for (const slug of permissionSlugs) {
      const permissionId = getPerm(slug);
      if (!permissionId) continue;
      SQLite.run(
        'INSERT OR IGNORE INTO role_permissions (id, role_id, permission_id, created_at) VALUES (?, ?, ?, ?)',
        [randomUUID(), role.id, permissionId, now]
      );
    }
  }
}
