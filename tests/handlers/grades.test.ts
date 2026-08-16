import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse, mockUser } from '../helpers/mocks';

vi.mock('@queries/grades', () => ({
  getGradesPaginated: vi.fn(),
  findGradeById: vi.fn(),
  findGradesByStudent: vi.fn(),
  createGrade: vi.fn(),
  updateGrade: vi.fn(),
  deleteGrade: vi.fn(),
  getClassSubjectSummary: vi.fn(),
}));

vi.mock('@queries/gradeAuditLogs', () => ({
  logGradeChange: vi.fn(),
}));

vi.mock('@queries/students', () => ({ findAllStudents: vi.fn(() => []) }));
vi.mock('@queries/subjects', () => ({ findAllSubjects: vi.fn(() => []) }));
vi.mock('@queries/classes', () => ({ findAllClasses: vi.fn(() => []) }));
vi.mock('@queries/academicYears', () => ({ findAllAcademicYears: vi.fn(() => []) }));

vi.mock('@queries/users', () => ({
  isAdmin: vi.fn(() => true),
  hasPermission: vi.fn(() => false),
}));

vi.mock('@services/Logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { addGrade, editGrade, removeGrade } from '../../app/handlers/grades';
import { createGrade, updateGrade, deleteGrade, findGradeById } from '@queries/grades';
import { logGradeChange } from '@queries/gradeAuditLogs';
import { isAdmin } from '@queries/users';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const gradeBody = {
  student_id: uuid(1),
  subject_id: uuid(2),
  class_id: uuid(3),
  type: 'task',
  score: 90,
  date: 1750000000000,
  teacher_user_id: uuid(4),
};

describe('grades handler audit hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('logs a create action when a grade is added', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(createGrade).mockReturnValue({ id: 'grade-1', ...gradeBody, created_at: 1, updated_at: 1 } as never);
    const req = mockRequest({ body: gradeBody, user: mockUser({ id: 'user-1' }) });
    const res = mockResponse();

    addGrade(req, res);

    expect(logGradeChange).toHaveBeenCalledWith({
      grade_id: 'grade-1',
      student_id: gradeBody.student_id,
      subject_id: gradeBody.subject_id,
      class_id: gradeBody.class_id,
      type: 'task',
      action: 'create',
      old_score: null,
      new_score: 90,
      user_id: 'user-1',
    });
  });

  it('logs an update action with old and new scores', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(findGradeById).mockReturnValue({ id: 'grade-1', ...gradeBody, score: 80, created_at: 1, updated_at: 1 } as never);
    vi.mocked(updateGrade).mockReturnValue({ id: 'grade-1', ...gradeBody, score: 90, created_at: 1, updated_at: 2 } as never);
    const req = mockRequest({ params: { id: 'grade-1' }, body: { score: 90 }, user: mockUser({ id: 'user-1' }) });
    const res = mockResponse();

    editGrade(req, res);

    expect(logGradeChange).toHaveBeenCalledWith(expect.objectContaining({
      grade_id: 'grade-1',
      action: 'update',
      old_score: 80,
      new_score: 90,
      user_id: 'user-1',
    }));
  });

  it('logs a delete action with the old score', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(findGradeById).mockReturnValue({ id: 'grade-1', ...gradeBody, score: 80, created_at: 1, updated_at: 1 } as never);
    vi.mocked(deleteGrade).mockReturnValue(true);
    const req = mockRequest({ params: { id: 'grade-1' }, user: mockUser({ id: 'user-1' }) });
    const res = mockResponse();

    removeGrade(req, res);

    expect(logGradeChange).toHaveBeenCalledWith(expect.objectContaining({
      grade_id: 'grade-1',
      action: 'delete',
      old_score: 80,
      new_score: null,
      user_id: 'user-1',
    }));
  });

  it('does not log when the grade to delete does not exist', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(findGradeById).mockReturnValue(undefined);
    vi.mocked(deleteGrade).mockReturnValue(false);
    const req = mockRequest({ params: { id: 'missing' }, user: mockUser({ id: 'user-1' }) });
    const res = mockResponse();

    removeGrade(req, res);

    expect(logGradeChange).not.toHaveBeenCalled();
    expect(res._status).toBe(404);
  });
});
