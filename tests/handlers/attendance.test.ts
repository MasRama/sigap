import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse, mockUser } from '../helpers/mocks';

vi.mock('@queries/studentAttendance', () => ({ findAttendanceByStudent: vi.fn() }));
vi.mock('@queries/students', () => ({ findStudentById: vi.fn() }));
vi.mock('@queries/users', () => ({
  isAdmin: vi.fn(() => false),
  hasPermission: vi.fn(() => true),
  hasRole: vi.fn(() => true),
}));

import { attendanceReportData } from '../../app/handlers/attendance';
import { findAttendanceByStudent } from '@queries/studentAttendance';
import { findStudentById } from '@queries/students';

const parentRequest = (overrides: Parameters<typeof mockRequest>[0] = {}) =>
  mockRequest({ user: mockUser({ id: 'parent-1', roles: ['parent'] }), ...overrides });

describe('parent attendance report scope', () => {
  beforeEach(() => vi.clearAllMocks());

  it('denies attendance reports for parents', () => {
    const res = mockResponse();

    attendanceReportData(parentRequest({ params: { studentId: 'student-2' } }), res);

    expect(res._status).toBe(403);
    expect(findStudentById).not.toHaveBeenCalled();
    expect(findAttendanceByStudent).not.toHaveBeenCalled();
  });
});
