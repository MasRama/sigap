import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse, mockUser } from '../helpers/mocks';

vi.mock('@queries/gradeAuditLogs', () => ({
  getGradeAuditLogsPaginated: vi.fn(),
}));

vi.mock('@queries/users', () => ({
  isAdmin: vi.fn(() => false),
  hasPermission: vi.fn(() => false),
}));

import { gradeAuditPage, gradeAuditData } from '../../app/handlers/gradeAudit';
import { getGradeAuditLogsPaginated } from '@queries/gradeAuditLogs';
import { isAdmin, hasPermission } from '@queries/users';

const logRow = {
  id: 'log-1',
  action: 'update',
  student_name: 'Ani',
  subject_name: 'Matematika',
  class_name: '10A',
  type: 'task',
  old_score: 80,
  new_score: 90,
  user_name: 'Admin',
  created_at: 1750000000000,
};

describe('gradeAuditPage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('redirects to login when unauthenticated', () => {
    const req = mockRequest({ user: undefined });
    const res = mockResponse({ inertia: vi.fn() });

    gradeAuditPage(req, res);

    expect(res._redirectUrl).toBe('/login');
  });

  it('renders an empty page without audit permission', () => {
    const req = mockRequest({ user: mockUser() });
    const res = mockResponse({ inertia: vi.fn() });

    gradeAuditPage(req, res);

    expect(res.inertia).toHaveBeenCalledWith('gradeAudit', { canView: false, logs: [], meta: undefined });
  });

  it('renders logs with pagination for users with audit permission', () => {
    vi.mocked(hasPermission).mockReturnValue(true);
    vi.mocked(getGradeAuditLogsPaginated).mockReturnValue({ data: [logRow], total: 1 });
    const req = mockRequest({ user: mockUser() });
    const res = mockResponse({ inertia: vi.fn() });

    gradeAuditPage(req, res);

    expect(res.inertia).toHaveBeenCalledWith('gradeAudit', {
      canView: true,
      logs: [logRow],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
    });
  });

  it('denies admins even when audit permission is present', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(hasPermission).mockReturnValue(true);
    const req = mockRequest({ user: mockUser() });
    const res = mockResponse({ inertia: vi.fn() });

    gradeAuditPage(req, res);

    expect(res.inertia).toHaveBeenCalledWith('gradeAudit', expect.objectContaining({ canView: false }));
    expect(getGradeAuditLogsPaginated).not.toHaveBeenCalled();
  });
});

describe('gradeAuditData', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 401 when unauthenticated', () => {
    const req = mockRequest({ user: undefined });
    const res = mockResponse();

    gradeAuditData(req, res);

    expect(res._status).toBe(401);
  });

  it('returns 403 without audit permission', () => {
    const req = mockRequest({ user: mockUser() });
    const res = mockResponse();

    gradeAuditData(req, res);

    expect(res._status).toBe(403);
  });

  it('returns paginated logs with audit permission', () => {
    vi.mocked(hasPermission).mockReturnValue(true);
    vi.mocked(getGradeAuditLogsPaginated).mockReturnValue({ data: [logRow], total: 1 });
    const req = mockRequest({ user: mockUser() });
    const res = mockResponse();

    gradeAuditData(req, res);

    expect(res._status).toBe(200);
    expect(res._body).toMatchObject({
      success: true,
      data: [logRow],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
  });
});
