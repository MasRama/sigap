import type SQLiteType from '../app/services/SQLite';
import { randomUUID } from 'crypto';

const DEFAULT_COMPONENTS = [
  { type: 'task', name: 'Tugas', weight: 20 },
  { type: 'daily_quiz', name: 'Kuis Harian', weight: 20 },
  { type: 'midterm', name: 'UTS', weight: 30 },
  { type: 'final', name: 'UAS', weight: 30 },
] as const;

export function run(SQLite: typeof SQLiteType): void {
  const years = SQLite.many<{ id: string }>`SELECT id FROM academic_years`;
  const now = Date.now();

  for (const year of years) {
    for (const component of DEFAULT_COMPONENTS) {
      SQLite.run(
        'INSERT OR IGNORE INTO grade_components (id, academic_year_id, type, name, weight, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [randomUUID(), year.id, component.type, component.name, component.weight, now, now]
      );
    }
  }
}
