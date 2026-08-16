import type SQLiteType from '../app/services/SQLite';
import { randomUUID } from 'crypto';

export function run(SQLite: typeof SQLiteType): void {
  const now = Date.now();
  const permissions = [
    { name: 'View Users', slug: 'users.view', resource: 'users', action: 'view' },
    { name: 'Create Users', slug: 'users.create', resource: 'users', action: 'create' },
    { name: 'Edit Users', slug: 'users.edit', resource: 'users', action: 'edit' },
    { name: 'Delete Users', slug: 'users.delete', resource: 'users', action: 'delete' },
    { name: 'View Roles', slug: 'roles.view', resource: 'roles', action: 'view' },
    { name: 'Create Roles', slug: 'roles.create', resource: 'roles', action: 'create' },
    { name: 'Edit Roles', slug: 'roles.edit', resource: 'roles', action: 'edit' },
    { name: 'Delete Roles', slug: 'roles.delete', resource: 'roles', action: 'delete' },
    { name: 'View Settings', slug: 'settings.view', resource: 'settings', action: 'view' },
    { name: 'Edit Settings', slug: 'settings.edit', resource: 'settings', action: 'edit' },

    // Master Data
    { name: 'View Academic Years', slug: 'academic_years.view', resource: 'academic_years', action: 'view' },
    { name: 'Create Academic Years', slug: 'academic_years.create', resource: 'academic_years', action: 'create' },
    { name: 'Edit Academic Years', slug: 'academic_years.edit', resource: 'academic_years', action: 'edit' },
    { name: 'Delete Academic Years', slug: 'academic_years.delete', resource: 'academic_years', action: 'delete' },
    { name: 'View Classes', slug: 'classes.view', resource: 'classes', action: 'view' },
    { name: 'Create Classes', slug: 'classes.create', resource: 'classes', action: 'create' },
    { name: 'Edit Classes', slug: 'classes.edit', resource: 'classes', action: 'edit' },
    { name: 'Delete Classes', slug: 'classes.delete', resource: 'classes', action: 'delete' },
    { name: 'View Subjects', slug: 'subjects.view', resource: 'subjects', action: 'view' },
    { name: 'Create Subjects', slug: 'subjects.create', resource: 'subjects', action: 'create' },
    { name: 'Edit Subjects', slug: 'subjects.edit', resource: 'subjects', action: 'edit' },
    { name: 'Delete Subjects', slug: 'subjects.delete', resource: 'subjects', action: 'delete' },

    // People
    { name: 'View Students', slug: 'students.view', resource: 'students', action: 'view' },
    { name: 'Create Students', slug: 'students.create', resource: 'students', action: 'create' },
    { name: 'Edit Students', slug: 'students.edit', resource: 'students', action: 'edit' },
    { name: 'Delete Students', slug: 'students.delete', resource: 'students', action: 'delete' },
    { name: 'View Teachers', slug: 'teachers.view', resource: 'teachers', action: 'view' },
    { name: 'Create Teachers', slug: 'teachers.create', resource: 'teachers', action: 'create' },
    { name: 'Edit Teachers', slug: 'teachers.edit', resource: 'teachers', action: 'edit' },
    { name: 'Delete Teachers', slug: 'teachers.delete', resource: 'teachers', action: 'delete' },
    { name: 'View Parents', slug: 'parents.view', resource: 'parents', action: 'view' },
    { name: 'Create Parents', slug: 'parents.create', resource: 'parents', action: 'create' },
    { name: 'Edit Parents', slug: 'parents.edit', resource: 'parents', action: 'edit' },
    { name: 'Delete Parents', slug: 'parents.delete', resource: 'parents', action: 'delete' },

    // Operations
    { name: 'View Schedules', slug: 'schedules.view', resource: 'schedules', action: 'view' },
    { name: 'Create Schedules', slug: 'schedules.create', resource: 'schedules', action: 'create' },
    { name: 'Edit Schedules', slug: 'schedules.edit', resource: 'schedules', action: 'edit' },
    { name: 'Delete Schedules', slug: 'schedules.delete', resource: 'schedules', action: 'delete' },
    { name: 'View School Locations', slug: 'school_locations.view', resource: 'school_locations', action: 'view' },
    { name: 'Create School Locations', slug: 'school_locations.create', resource: 'school_locations', action: 'create' },
    { name: 'Edit School Locations', slug: 'school_locations.edit', resource: 'school_locations', action: 'edit' },
    { name: 'Delete School Locations', slug: 'school_locations.delete', resource: 'school_locations', action: 'delete' },

    // Teacher Flow
    { name: 'View Confirmations', slug: 'confirmations.view', resource: 'confirmations', action: 'view' },
    { name: 'Submit Confirmations', slug: 'confirmations.create', resource: 'confirmations', action: 'create' },
    { name: 'View Journals', slug: 'journals.view', resource: 'journals', action: 'view' },
    { name: 'Create Journals', slug: 'journals.create', resource: 'journals', action: 'create' },
    { name: 'Edit Journals', slug: 'journals.edit', resource: 'journals', action: 'edit' },
    { name: 'Delete Journals', slug: 'journals.delete', resource: 'journals', action: 'delete' },

    // Grades & Attendance
    { name: 'View Grades', slug: 'grades.view', resource: 'grades', action: 'view' },
    { name: 'Create Grades', slug: 'grades.create', resource: 'grades', action: 'create' },
    { name: 'Edit Grades', slug: 'grades.edit', resource: 'grades', action: 'edit' },
    { name: 'Delete Grades', slug: 'grades.delete', resource: 'grades', action: 'delete' },
    { name: 'View Grade Audit', slug: 'grades.audit', resource: 'grades', action: 'audit' },
    { name: 'View Attendance', slug: 'attendance.view', resource: 'attendance', action: 'view' },
    { name: 'Create Attendance', slug: 'attendance.create', resource: 'attendance', action: 'create' },
    { name: 'Edit Attendance', slug: 'attendance.edit', resource: 'attendance', action: 'edit' },
    { name: 'Delete Attendance', slug: 'attendance.delete', resource: 'attendance', action: 'delete' },

    // Headmaster & Reports
    { name: 'Headmaster View', slug: 'headmaster.view', resource: 'headmaster', action: 'view' },
  ];

  for (const p of permissions) {
    SQLite.run(
      'INSERT OR IGNORE INTO permissions (id, name, slug, resource, action, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [randomUUID(), p.name, p.slug, p.resource, p.action, now, now]
    );
  }
}
