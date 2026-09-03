import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@services/SQLite', () => ({
  default: {
    one: vi.fn(),
    many: vi.fn(),
    exec: vi.fn(),
    get: vi.fn(),
    all: vi.fn(),
    run: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn((callback: () => void) => callback()),
    raw: vi.fn(),
  },
}));

import SQLite from '@services/SQLite';
import { findAllClassesWithHomeroom, findClassesByAcademicYearWithHomeroom } from '../../app/queries/classes';

describe('class queries', () => {
  beforeEach(() => vi.clearAllMocks());

  it('includes the number of students in each class', () => {
    vi.mocked(SQLite.many).mockReturnValue([{ id: 'class-1', student_count: 4 }] as never);

    const result = findAllClassesWithHomeroom();
    const call = vi.mocked(SQLite.many).mock.calls[0];

    expect(result[0]?.student_count).toBe(4);
    expect(String(call?.[0])).toContain('COUNT(DISTINCT s.id) AS student_count');
    expect(String(call?.[0])).toContain('LEFT JOIN students s ON s.class_id = c.id');
  });

  it('keeps student counts scoped to the selected academic year', () => {
    vi.mocked(SQLite.many).mockReturnValue([] as never);

    findClassesByAcademicYearWithHomeroom('year-1');
    const call = vi.mocked(SQLite.many).mock.calls[0];

    expect(String(call?.[0])).toContain('WHERE c.academic_year_id =');
    expect(call?.[1]).toBe('year-1');
  });
});
