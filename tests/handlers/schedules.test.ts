import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse, mockUser } from '../helpers/mocks';

vi.mock('@queries/schedules', () => ({
  findAllSchedules: vi.fn(() => []),
  findScheduleById: vi.fn(),
  findSchedulesByClass: vi.fn(() => []),
  findSchedulesByTeacher: vi.fn(() => []),
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  deleteSchedule: vi.fn(),
}));
vi.mock('@queries/classes', () => ({ findAllClasses: vi.fn(() => []) }));
vi.mock('@queries/subjects', () => ({ findAllSubjects: vi.fn(() => []) }));
vi.mock('@queries/academicYears', () => ({ findAllAcademicYears: vi.fn(() => []) }));
vi.mock('@queries/teachers', () => ({ findTeacherUsersForSchedule: vi.fn(() => []) }));
vi.mock('@queries/teacherClassAssignments', () => ({ isTeacherUser: vi.fn(() => false) }));
vi.mock('@queries/users', () => ({
  isAdmin: vi.fn(() => false),
  hasPermission: vi.fn(() => false),
}));
vi.mock('@services/Logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { schedulesPage, listSchedules, addSchedule } from '../../app/handlers/schedules';
import { findAllSchedules, findSchedulesByTeacher } from '@queries/schedules';
import { findAllClasses } from '@queries/classes';
import { findAllSubjects } from '@queries/subjects';
import { findAllAcademicYears } from '@queries/academicYears';
import { findTeacherUsersForSchedule } from '@queries/teachers';
import { isTeacherUser } from '@queries/teacherClassAssignments';
import { isAdmin, hasPermission } from '@queries/users';

const schedule = {
  id: 'schedule-1',
  class_id: 'class-1',
  subject_id: 'subject-1',
  teacher_user_id: 'teacher-1',
  day_of_week: 1,
  start_time: 100,
  end_time: 200,
  academic_year_id: 'year-1',
};

describe('schedules role boundaries', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads schedule management data for an admin operator', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(findAllSchedules).mockReturnValue([schedule] as never);
    vi.mocked(findAllClasses).mockReturnValue([{ id: 'class-1', name: '10A' }] as never);
    vi.mocked(findAllSubjects).mockReturnValue([{ id: 'subject-1', name: 'Matematika' }] as never);
    vi.mocked(findAllAcademicYears).mockReturnValue([{ id: 'year-1', name: '2025/2026' }] as never);
    vi.mocked(findTeacherUsersForSchedule).mockReturnValue([{ id: 'teacher-1', name: 'Budi', username: 'budi' }]);
    const inertia = vi.fn();
    const req = mockRequest({ user: mockUser({ id: 'admin-1' }) });
    const res = mockResponse({ inertia });

    schedulesPage(req, res);

    expect(inertia).toHaveBeenCalledWith('schedules', expect.objectContaining({
      schedules: [schedule],
      classes: [{ id: 'class-1', name: '10A' }],
      subjects: [{ id: 'subject-1', name: 'Matematika' }],
      years: [{ id: 'year-1', name: '2025/2026' }],
      teachers: [{ id: 'teacher-1', name: 'Budi', username: 'budi' }],
      permissions: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    }));
  });

  it('keeps the headmaster read-only while showing schedules', () => {
    vi.mocked(isAdmin).mockReturnValue(false);
    vi.mocked(hasPermission).mockReturnValue(true);
    const inertia = vi.fn();
    const req = mockRequest({ user: mockUser({ id: 'headmaster-1' }) });
    const res = mockResponse({ inertia });

    schedulesPage(req, res);

    expect(inertia).toHaveBeenCalledWith('schedules', expect.objectContaining({
      permissions: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    }));
  });

  it('scopes schedule API results to the authenticated teacher', () => {
    vi.mocked(isAdmin).mockReturnValue(false);
    vi.mocked(hasPermission).mockReturnValue(true);
    vi.mocked(isTeacherUser).mockReturnValue(true);
    vi.mocked(findSchedulesByTeacher).mockReturnValue([
      schedule,
      { ...schedule, id: 'schedule-2', class_id: 'class-2' },
    ] as never);
    const req = mockRequest({
      query: { teacher_user_id: 'teacher-1', class_id: 'class-1' },
      user: mockUser({ id: 'teacher-1' }),
    });
    const res = mockResponse();

    listSchedules(req, res);

    expect(res._status).toBe(200);
    expect(res._body).toEqual(expect.objectContaining({ data: [schedule] }));
    expect(findSchedulesByTeacher).toHaveBeenCalledWith('teacher-1');
  });

  it('does not let a headmaster create a schedule', () => {
    vi.mocked(isAdmin).mockReturnValue(false);
    vi.mocked(hasPermission).mockReturnValue(true);
    const req = mockRequest({ user: mockUser({ id: 'headmaster-1' }) });
    const res = mockResponse();

    addSchedule(req, res);

    expect(res._status).toBe(403);
  });
});
