import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@services/SQLite', () => ({
  default: {
    one: vi.fn(),
    many: vi.fn(),
    all: vi.fn(),
    exec: vi.fn(),
    transaction: vi.fn((callback: () => void) => callback()),
  },
}));

import SQLite from '@services/SQLite';
import { isTeacherAssignedToClass, syncTeacherClassAssignments } from '../../app/queries/teacherClassAssignments';

const yearId = '00000000-0000-4000-8000-000000000001';
const classId = '00000000-0000-4000-8000-000000000002';

describe('teacher class assignment queries', () => {
  beforeEach(() => vi.clearAllMocks());

  it('checks a teacher assignment against the class academic year', () => {
    vi.mocked(SQLite.one).mockReturnValue({ id: 'assignment-1' });

    expect(isTeacherAssignedToClass('teacher-user-1', classId)).toBe(true);
    expect(SQLite.one).toHaveBeenCalled();
  });

  it('replaces assignments atomically and transfers homeroom ownership', () => {
    vi.mocked(SQLite.all).mockReturnValue([{ id: classId }]);

    syncTeacherClassAssignments('teacher-1', yearId, [{ class_id: classId, is_homeroom: true }]);

    expect(SQLite.transaction).toHaveBeenCalledTimes(1);
    expect(SQLite.exec).toHaveBeenCalledTimes(3);
    expect(SQLite.all).toHaveBeenCalledWith(expect.any(String), [yearId, classId]);
  });

  it('rejects classes outside the selected academic year', () => {
    vi.mocked(SQLite.all).mockReturnValue([]);

    expect(() => syncTeacherClassAssignments('teacher-1', yearId, [{ class_id: classId, is_homeroom: false }])).toThrow();
    expect(SQLite.transaction).not.toHaveBeenCalled();
  });
});
