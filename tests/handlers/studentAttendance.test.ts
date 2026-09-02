import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse, mockUser } from '../helpers/mocks';

vi.mock('@queries/studentAttendance', () => ({
  findAttendanceByJournal: vi.fn(),
  findAttendanceByStudent: vi.fn(),
  findStudentAttendanceById: vi.fn(),
  upsertStudentAttendance: vi.fn(),
  deleteStudentAttendance: vi.fn(),
}));
vi.mock('@queries/journals', () => ({ findJournalById: vi.fn() }));
vi.mock('@queries/schedules', () => ({ findScheduleById: vi.fn() }));
vi.mock('@queries/teacherClassAssignments', () => ({ isTeacherUser: vi.fn(() => false) }));
vi.mock('@queries/users', () => ({
  isAdmin: vi.fn(() => false),
  hasPermission: vi.fn(() => true),
  hasRole: vi.fn(() => true),
}));
vi.mock('@services/Logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { listAttendanceByJournal, listAttendanceByStudent } from '../../app/handlers/studentAttendance';
import { findAttendanceByJournal, findAttendanceByStudent } from '@queries/studentAttendance';
import { findJournalById } from '@queries/journals';

const parentRequest = (overrides: Parameters<typeof mockRequest>[0] = {}) =>
  mockRequest({ user: mockUser({ id: 'parent-1', roles: ['parent'] }), ...overrides });

describe('parent attendance scope', () => {
  beforeEach(() => vi.clearAllMocks());

  it('denies direct attendance access for another student', () => {
    const res = mockResponse();

    listAttendanceByStudent(parentRequest({ params: { studentId: 'student-2' } }), res);

    expect(res._status).toBe(403);
    expect(findAttendanceByStudent).not.toHaveBeenCalled();
  });

  it('denies journal attendance access to parents', () => {
    const res = mockResponse();

    vi.mocked(findJournalById).mockReturnValue({ id: 'journal-2', schedule_id: 'schedule-2' } as never);
    listAttendanceByJournal(parentRequest({ params: { journalId: 'journal-2' } }), res);

    expect(res._status).toBe(403);
    expect(findJournalById).toHaveBeenCalledWith('journal-2');
    expect(findAttendanceByJournal).not.toHaveBeenCalled();
  });
});
