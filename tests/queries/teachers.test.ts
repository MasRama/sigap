import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@services/SQLite', () => ({
  default: {
    one: vi.fn(),
    many: vi.fn(),
    all: vi.fn(),
    get: vi.fn(),
    exec: vi.fn(),
    run: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn((callback: () => void) => callback()),
  },
}));

import SQLite from '@services/SQLite';
import { getTeachersPaginated } from '../../app/queries/teachers';

describe('teacher queries', () => {
  beforeEach(() => vi.clearAllMocks());

  it('includes distinct subject names in the paginated teacher list', () => {
    vi.mocked(SQLite.get).mockReturnValue({ count: 1 });
    vi.mocked(SQLite.all).mockReturnValue([{
      id: 'teacher-1',
      employee_id: '1987001',
      user_name: 'Budi Santoso',
      subject_names: 'Biology, Mathematics',
    }]);

    const result = getTeachersPaginated(1, 10, 'budi');

    expect(result.data[0]?.subject_names).toBe('Biology, Mathematics');
    expect(SQLite.all).toHaveBeenCalledWith(expect.stringContaining('GROUP_CONCAT(name, \', \')'), [
      '%budi%',
      '%budi%',
      10,
      0,
    ]);
    expect(SQLite.all).toHaveBeenCalledWith(expect.stringContaining('SELECT DISTINCT ts.teacher_id, sub.name'), expect.any(Array));
  });
});
