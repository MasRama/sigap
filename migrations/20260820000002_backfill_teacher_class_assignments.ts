import type SQLiteType from '../app/services/SQLite';
import { randomUUID } from 'crypto';

export function up(SQLite: typeof SQLiteType): void {
  const rows = SQLite.all<{ teacher_id: string; class_id: string; academic_year_id: string; created_at: number | null }>(`
    SELECT DISTINCT teacher_id, class_id, academic_year_id, created_at
    FROM class_subjects
    WHERE teacher_id IS NOT NULL
  `);

  for (const row of rows) {
    SQLite.run(
      `INSERT OR IGNORE INTO teacher_class_assignments
       (id, teacher_id, class_id, academic_year_id, is_homeroom, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [randomUUID(), row.teacher_id, row.class_id, row.academic_year_id, row.created_at ?? Date.now()],
    );
  }
}
