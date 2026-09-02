import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse, mockUser } from '../helpers/mocks';

vi.mock('@queries/students', () => ({
  findStudentById: vi.fn(),
  findStudentsByParent: vi.fn(),
}));
vi.mock('@queries/parents', () => ({ findParentByUserId: vi.fn() }));
vi.mock('@queries/grades', () => ({
  getStudentGradeSummaries: vi.fn(),
  getStudentContext: vi.fn(),
}));
vi.mock('@queries/studentAttendance', () => ({ findAttendanceByStudent: vi.fn() }));
vi.mock('@queries/users', () => ({
  isAdmin: vi.fn(() => false),
  hasPermission: vi.fn(() => true),
  hasRole: vi.fn(() => true),
}));

import { raporPage } from '../../app/handlers/rapor';
import { findStudentById } from '@queries/students';
import { findParentByUserId } from '@queries/parents';
import { findStudentsByParent } from '@queries/students';

describe('parent report scope', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects when a parent requests another student report', () => {
    vi.mocked(findParentByUserId).mockReturnValue({ user_id: 'parent-1' } as never);
    vi.mocked(findStudentsByParent).mockReturnValue([]);
    const req = mockRequest({
      user: mockUser({ id: 'parent-1', roles: ['parent'] }),
      params: { studentId: 'student-2' },
    });
    const res = mockResponse({ inertia: vi.fn() });

    raporPage(req, res);

    expect(res._redirectUrl).toBe('/dashboard');
    expect(findStudentById).not.toHaveBeenCalled();
  });
});
