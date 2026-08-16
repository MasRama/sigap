import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse, mockUser } from '../helpers/mocks';

vi.mock('@queries/notifications', () => ({
  findNotificationsByUser: vi.fn(() => []),
  getUnreadNotificationCount: vi.fn(() => 0),
  markAllNotificationsRead: vi.fn(),
  createGradePublishedNotifications: vi.fn(() => 0),
}));

vi.mock('@queries/academicYears', () => ({
  findAllAcademicYears: vi.fn(() => []),
  findAcademicYearById: vi.fn(),
  createAcademicYear: vi.fn(),
  updateAcademicYear: vi.fn(),
  deleteAcademicYear: vi.fn(),
  setActiveAcademicYear: vi.fn(),
}));

vi.mock('@queries/gradeComponents', () => ({
  findGradeComponentsByYear: vi.fn(() => []),
  upsertGradeComponents: vi.fn(),
}));

vi.mock('@queries/users', () => ({
  isAdmin: vi.fn(() => true),
  hasPermission: vi.fn(() => false),
}));

vi.mock('@services/Logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { notificationsData, markNotificationsRead } from '../../app/handlers/notifications';
import { toggleGradesPublication } from '../../app/handlers/academicYears';
import { getUnreadNotificationCount, markAllNotificationsRead, createGradePublishedNotifications } from '@queries/notifications';
import { findAcademicYearById, updateAcademicYear } from '@queries/academicYears';
import { isAdmin } from '@queries/users';

describe('notifications handler', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns unread count and notifications for the user', () => {
    vi.mocked(getUnreadNotificationCount).mockReturnValue(2);
    const req = mockRequest({ user: mockUser({ id: 'user-1' }) });
    const res = mockResponse();

    notificationsData(req, res);

    expect(res._status).toBe(200);
    expect(res._body).toMatchObject({ success: true, data: { unread: 2, notifications: [] } });
  });

  it('returns 401 when unauthenticated', () => {
    const req = mockRequest({ user: undefined });
    const res = mockResponse();

    notificationsData(req, res);

    expect(res._status).toBe(401);
  });

  it('marks all notifications read for the user', () => {
    const req = mockRequest({ user: mockUser({ id: 'user-1' }) });
    const res = mockResponse();

    markNotificationsRead(req, res);

    expect(markAllNotificationsRead).toHaveBeenCalledWith('user-1');
    expect(res._status).toBe(200);
  });
});

describe('toggleGradesPublication notification hook', () => {
  beforeEach(() => vi.resetAllMocks());

  it('notifies parents when grades are published', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(findAcademicYearById).mockReturnValue({ id: 'year-1', name: '2025/2026', is_grades_published: 0 } as never);
    vi.mocked(updateAcademicYear).mockReturnValue({ id: 'year-1', name: '2025/2026', is_grades_published: 1 } as never);
    const req = mockRequest({ params: { id: 'year-1' }, user: mockUser() });
    const res = mockResponse();

    toggleGradesPublication(req, res);

    expect(updateAcademicYear).toHaveBeenCalledWith('year-1', { is_grades_published: 1 });
    expect(createGradePublishedNotifications).toHaveBeenCalledWith('2025/2026');
  });

  it('does not notify when grades are unpublished', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(findAcademicYearById).mockReturnValue({ id: 'year-1', name: '2025/2026', is_grades_published: 1 } as never);
    vi.mocked(updateAcademicYear).mockReturnValue({ id: 'year-1', name: '2025/2026', is_grades_published: 0 } as never);
    const req = mockRequest({ params: { id: 'year-1' }, user: mockUser() });
    const res = mockResponse();

    toggleGradesPublication(req, res);

    expect(createGradePublishedNotifications).not.toHaveBeenCalled();
  });
});
