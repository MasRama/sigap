import type SQLiteType from '../app/services/SQLite';

type RolePermissionUpdate = {
  slug: string;
  name: string;
  description: string;
};

const roleUpdates: RolePermissionUpdate[] = [
  { slug: 'admin', name: 'Admin', description: 'Operator pengelola data dan konfigurasi sekolah' },
  { slug: 'headmaster', name: 'Kepala Sekolah', description: 'Pengawasan sekolah dan laporan' },
  { slug: 'teacher', name: 'Guru', description: 'Mengajar, jurnal, presensi, dan penilaian kelas' },
  { slug: 'parent', name: 'Orang Tua', description: 'Melihat data anak, kehadiran, dan nilai' },
];

const revokedPermissions: Record<string, string[]> = {
  admin: [
    'confirmations.create',
    'journals.view', 'journals.create', 'journals.edit', 'journals.delete',
    'grades.view', 'grades.create', 'grades.edit', 'grades.delete', 'grades.audit',
    'attendance.view', 'attendance.create', 'attendance.edit', 'attendance.delete',
    'headmaster.view',
  ],
  headmaster: [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
    'settings.view', 'settings.edit',
    'academic_years.create', 'academic_years.edit', 'academic_years.delete',
    'classes.create', 'classes.edit', 'classes.delete',
    'subjects.create', 'subjects.edit', 'subjects.delete',
    'students.create', 'students.edit', 'students.delete',
    'teachers.create', 'teachers.edit', 'teachers.delete',
    'parents.create', 'parents.edit', 'parents.delete',
    'schedules.create', 'schedules.edit', 'schedules.delete',
    'school_locations.create', 'school_locations.edit', 'school_locations.delete',
    'confirmations.create',
    'journals.create', 'journals.edit', 'journals.delete',
    'grades.create', 'grades.edit', 'grades.delete',
    'attendance.create', 'attendance.edit', 'attendance.delete',
    'qr_settings.view', 'qr_settings.edit',
  ],
};

export function up(SQLite: typeof SQLiteType): void {
  for (const role of roleUpdates) {
    SQLite.run(
      'UPDATE roles SET name = ?, description = ?, updated_at = ? WHERE slug = ?',
      [role.name, role.description, Date.now(), role.slug],
    );
  }

  for (const [roleSlug, permissionSlugs] of Object.entries(revokedPermissions)) {
    const role = SQLite.get<{ id: string }>('SELECT id FROM roles WHERE slug = ?', [roleSlug]);
    if (!role) continue;

    for (const permissionSlug of permissionSlugs) {
      const permission = SQLite.get<{ id: string }>('SELECT id FROM permissions WHERE slug = ?', [permissionSlug]);
      if (!permission) continue;
      SQLite.run(
        'DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [role.id, permission.id],
      );
    }
  }
}

