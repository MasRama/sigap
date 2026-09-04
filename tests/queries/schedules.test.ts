import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@services/SQLite', () => ({
  default: {
    one: vi.fn(),
    many: vi.fn(),
    exec: vi.fn(),
    run: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn((callback: () => void) => callback()),
  },
}));

import SQLite from '@services/SQLite';
import { findSchedulesByYearWithDetails } from '../../app/queries/schedules';

describe('schedule queries', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns year schedules with class, subject, and teacher names', () => {
    vi.mocked(SQLite.many).mockReturnValue([{
      id: 'schedule-1',
      class_name: '10A',
      subject_name: 'Matematika',
      teacher_name: 'Budi Santoso',
    }]);

    const rows = findSchedulesByYearWithDetails('year-1');

    expect(rows[0]?.class_name).toBe('10A');
    const call = vi.mocked(SQLite.many).mock.calls[0];
    expect(String(call[0])).toContain('INNER JOIN classes');
    expect(String(call[0])).toContain('INNER JOIN subjects');
    expect(call[1]).toBe('year-1');
  });
});
