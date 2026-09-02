import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse, mockUser } from '../helpers/mocks';

vi.mock('@queries/stats', () => ({ getClassSubjectStats: vi.fn() }));
vi.mock('@queries/users', () => ({
  isAdmin: vi.fn(() => false),
  hasPermission: vi.fn(() => true),
  hasRole: vi.fn(() => true),
}));

import { classSubjectReport } from '../../app/handlers/reports';
import { getClassSubjectStats } from '@queries/stats';

const parentRequest = (overrides: Parameters<typeof mockRequest>[0] = {}) =>
  mockRequest({
    user: mockUser({ id: 'parent-1', roles: ['parent'] }),
    query: { class_id: 'class-1', subject_id: 'subject-1' },
    ...overrides,
  });

describe('parent generic report scope', () => {
  beforeEach(() => vi.clearAllMocks());

  it('denies class-subject reports to parents', () => {
    const res = mockResponse();

    classSubjectReport(parentRequest(), res);

    expect(res._status).toBe(403);
    expect(getClassSubjectStats).not.toHaveBeenCalled();
  });
});
