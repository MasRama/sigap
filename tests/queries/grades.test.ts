import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@services/SQLite', () => ({
  default: {
    many: vi.fn(),
  },
}));

import SQLite from '@services/SQLite';
import { findGradeProgressionByStudent } from '../../app/queries/grades';

const progression = [
  {
    id: 'grade-1',
    subject_id: 'subject-1',
    subject_name: 'Matematika',
    type: 'UH',
    score: 78,
    date: 1,
  },
];

describe('grade progression queries', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a student history ordered by assessment date', () => {
    vi.mocked(SQLite.many).mockReturnValue(progression as never);

    const result = findGradeProgressionByStudent('student-1');

    expect(result).toEqual(progression);
    expect(SQLite.many).toHaveBeenCalled();
    const [query] = vi.mocked(SQLite.many).mock.calls[0] ?? [];
    expect(String(query)).toContain('ORDER BY g.date ASC');
  });
});
