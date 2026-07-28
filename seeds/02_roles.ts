import type SQLiteType from '../app/services/SQLite';
import { randomUUID } from 'crypto';

export function run(SQLite: typeof SQLiteType): void {
  const now = Date.now();
  const roles = [
    { name: 'Admin', slug: 'admin', description: 'Full access to all features' },
    { name: 'Headmaster', slug: 'headmaster', description: 'School-wide oversight and reports' },
    { name: 'Teacher', slug: 'teacher', description: 'Class operations, journals, confirmations' },
    { name: 'Parent', slug: 'parent', description: 'View children attendance and grades' },
  ];

  for (const role of roles) {
    SQLite.run(
      'INSERT OR IGNORE INTO roles (id, name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [randomUUID(), role.name, role.slug, role.description, now, now]
    );
  }

  // Helper to get permission id by slug
  const getPerm = (slug: string): string | undefined =>
    SQLite.get<{ id: string }>('SELECT id FROM permissions WHERE slug = ?', [slug])?.id;

  // Admin gets all permissions
  const adminRole = SQLite.get<{ id: string }>("SELECT id FROM roles WHERE slug = 'admin'");
  if (adminRole) {
    const allPerms = SQLite.all<{ id: string }>('SELECT id FROM permissions');
    for (const p of allPerms) {
      SQLite.run(
        'INSERT OR IGNORE INTO role_permissions (id, role_id, permission_id, created_at) VALUES (?, ?, ?, ?)',
        [randomUUID(), adminRole.id, p.id, now]
      );
    }
  }

  // Headmaster: view + manage master data, view all reports, attendance, grades
  const headmasterRole = SQLite.get<{ id: string }>("SELECT id FROM roles WHERE slug = 'headmaster'");
  const headmasterSlugs = [
    'users.view', 'users.create', 'users.edit',
    'roles.view',
    'academic_years.view', 'academic_years.edit',
    'classes.view', 'classes.edit',
    'subjects.view', 'subjects.edit',
    'students.view', 'students.edit',
    'teachers.view', 'teachers.edit',
    'parents.view', 'parents.edit',
    'schedules.view', 'schedules.edit',
    'school_locations.view', 'school_locations.edit',
    'confirmations.view',
    'journals.view', 'journals.edit',
    'grades.view', 'grades.edit',
    'attendance.view', 'attendance.edit',
    'headmaster.view',
  ];
  if (headmasterRole) {
    for (const slug of headmasterSlugs) {
      const perm = getPerm(slug);
      if (perm) {
        SQLite.run(
          'INSERT OR IGNORE INTO role_permissions (id, role_id, permission_id, created_at) VALUES (?, ?, ?, ?)',
          [randomUUID(), headmasterRole.id, perm, now]
        );
      }
    }
  }

  // Teacher: schedules, confirmations, journals, grades, attendance for their classes
  const teacherRole = SQLite.get<{ id: string }>("SELECT id FROM roles WHERE slug = 'teacher'");
  const teacherSlugs = [
    'students.view',
    'teachers.view',
    'schedules.view',
    'school_locations.view',
    'confirmations.create', 'confirmations.view',
    'journals.view', 'journals.create', 'journals.edit',
    'grades.view', 'grades.create', 'grades.edit',
    'attendance.view', 'attendance.create', 'attendance.edit',
  ];
  if (teacherRole) {
    for (const slug of teacherSlugs) {
      const perm = getPerm(slug);
      if (perm) {
        SQLite.run(
          'INSERT OR IGNORE INTO role_permissions (id, role_id, permission_id, created_at) VALUES (?, ?, ?, ?)',
          [randomUUID(), teacherRole.id, perm, now]
        );
      }
    }
  }

  // Parent: view grades and attendance for their children
  const parentRole = SQLite.get<{ id: string }>("SELECT id FROM roles WHERE slug = 'parent'");
  const parentSlugs = [
    'students.view',
    'grades.view',
    'attendance.view',
  ];
  if (parentRole) {
    for (const slug of parentSlugs) {
      const perm = getPerm(slug);
      if (perm) {
        SQLite.run(
          'INSERT OR IGNORE INTO role_permissions (id, role_id, permission_id, created_at) VALUES (?, ?, ?, ?)',
          [randomUUID(), parentRole.id, perm, now]
        );
      }
    }
  }
}
