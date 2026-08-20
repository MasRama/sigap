import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse, mockUser } from '../helpers/mocks';

vi.mock('@queries/academicYears', () => ({
  findAllAcademicYears: vi.fn(() => []),
  findActiveAcademicYear: vi.fn(() => null),
}));
vi.mock('@queries/classes', () => ({ findClassesByAcademicYear: vi.fn(() => []) }));
vi.mock('@queries/teacherClassAssignments', () => ({
  findTeacherClassAssignmentsByAcademicYear: vi.fn(() => []),
  syncTeacherClassAssignments: vi.fn(),
}));
vi.mock('@queries/teachers', () => ({
  findAllTeachersForAssignment: vi.fn(() => []),
  findTeacherById: vi.fn(),
}));
vi.mock('@queries/users', () => ({ isAdmin: vi.fn(() => false) }));
vi.mock('@services/Logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { saveTeacherAssignments } from '../../app/handlers/teacherAssignments';
import { syncTeacherClassAssignments } from '@queries/teacherClassAssignments';
import { findTeacherById } from '@queries/teachers';
import { isAdmin } from '@queries/users';

const teacherId = '00000000-0000-4000-8000-000000000001';
const yearId = '00000000-0000-4000-8000-000000000002';
const classId = '00000000-0000-4000-8000-000000000003';

const validBody = {
  academic_year_id: yearId,
  assignments: [{ class_id: classId, is_homeroom: true }],
};

describe('teacher assignment handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(findTeacherById).mockReturnValue({ id: teacherId } as never);
  });

  it('requires an authenticated admin', () => {
    const res = mockResponse();
    saveTeacherAssignments(mockRequest({ params: { teacherId }, body: validBody }), res);
    expect(res._status).toBe(401);

    const forbidden = mockResponse();
    saveTeacherAssignments(mockRequest({ params: { teacherId }, body: validBody, user: mockUser() }), forbidden);
    expect(forbidden._status).toBe(403);
  });

  it('rejects more than one homeroom class', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    const res = mockResponse();
    saveTeacherAssignments(mockRequest({
      params: { teacherId },
      user: mockUser({ id: 'admin-1' }),
      body: {
        academic_year_id: yearId,
        assignments: [
          { class_id: classId, is_homeroom: true },
          { class_id: '00000000-0000-4000-8000-000000000004', is_homeroom: true },
        ],
      },
    }), res);
    expect(res._status).toBe(422);
    expect(syncTeacherClassAssignments).not.toHaveBeenCalled();
  });

  it('syncs a valid class assignment', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    const res = mockResponse();
    saveTeacherAssignments(mockRequest({
      params: { teacherId },
      user: mockUser({ id: 'admin-1' }),
      body: validBody,
    }), res);

    expect(res._status).toBe(200);
    expect(syncTeacherClassAssignments).toHaveBeenCalledWith(teacherId, yearId, validBody.assignments);
    expect(res._body).toMatchObject({ success: true });
  });
});
