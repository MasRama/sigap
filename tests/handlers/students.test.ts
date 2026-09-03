import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { NaraRequest } from '../../app/core/types';
import { mockRequest, mockResponse, mockUser } from '../helpers/mocks';

vi.mock('@queries/students', () => ({
  getStudentsPaginated: vi.fn(),
  findStudentById: vi.fn(),
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
  deleteStudent: vi.fn(),
  findStudentsByClass: vi.fn(),
  findAllNis: vi.fn(),
  importStudents: vi.fn(),
}));
vi.mock('@queries/classes', () => ({
  findAllClasses: vi.fn(() => []),
  findClassById: vi.fn(),
  findClassByName: vi.fn(),
}));
vi.mock('@queries/roles', () => ({ getUsersWithRole: vi.fn(() => []) }));
vi.mock('@queries/users', () => ({
  isAdmin: vi.fn(() => false),
  hasPermission: vi.fn(() => true),
  hasRole: vi.fn(() => true),
}));
vi.mock('@services/StudentCsvParser', () => ({ parseStudentCsv: vi.fn() }));
vi.mock('@services/Logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { addStudent, classStudentsPage, editStudent, importStudentsFromCsv, listStudents, removeStudent, studentData } from '../../app/handlers/students';
import { createStudent, deleteStudent, findAllNis, findStudentById, getStudentsPaginated, importStudents, updateStudent } from '@queries/students';
import { findAllClasses, findClassById, findClassByName } from '@queries/classes';
import { parseStudentCsv } from '@services/StudentCsvParser';
import { hasRole, isAdmin } from '@queries/users';

const parentRequest = (overrides: Parameters<typeof mockRequest>[0] = {}) =>
  mockRequest({ user: mockUser({ id: 'parent-1', roles: ['parent'] }), ...overrides });

describe('parent student scope', () => {
  beforeEach(() => vi.clearAllMocks());

  it('denies the generic student list to parents', () => {
    const res = mockResponse();

    listStudents(parentRequest(), res);

    expect(res._status).toBe(403);
    expect(getStudentsPaginated).not.toHaveBeenCalled();
  });

  it('denies direct access to another student record', () => {
    const res = mockResponse();

    studentData(parentRequest({ params: { id: 'student-2' } }), res);

    expect(res._status).toBe(403);
    expect(findStudentById).not.toHaveBeenCalled();
  });

  it('denies student creation to parents', () => {
    const res = mockResponse();

    addStudent(parentRequest({ body: {
      nis: '10002',
      name: 'Siswa Baru',
      class_id: 'class-1',
    } }), res);

    expect(res._status).toBe(403);
    expect(createStudent).not.toHaveBeenCalled();
  });

  it('denies student updates to parents', () => {
    const res = mockResponse();

    editStudent(parentRequest({ params: { id: 'student-2' }, body: { name: 'Nama Baru' } }), res);

    expect(res._status).toBe(403);
    expect(updateStudent).not.toHaveBeenCalled();
  });

  it('denies student deletion to parents', () => {
    const res = mockResponse();

    removeStudent(parentRequest({ params: { id: 'student-2' } }), res);

    expect(res._status).toBe(403);
    expect(deleteStudent).not.toHaveBeenCalled();
  });
  it('renders a class-scoped student page', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(hasRole).mockReturnValue(false);
    vi.mocked(findClassById).mockReturnValue({
      id: 'class-1',
      name: '10A',
      grade: '10',
      academic_year_id: 'year-1',
    } as never);
    vi.mocked(getStudentsPaginated).mockReturnValue({ data: [], total: 0 });
    const res = mockResponse({ inertia: vi.fn() });

    classStudentsPage(
      mockRequest({ user: mockUser({ id: 'admin-1', roles: ['admin'] }), params: { id: 'class-1' } }),
      res,
    );

    expect(findClassById).toHaveBeenCalledWith('class-1');
    expect(getStudentsPaginated).toHaveBeenCalledWith(1, 10, '', 'class-1');
    expect(res.inertia).toHaveBeenCalledWith('students', expect.objectContaining({
      classId: 'class-1',
      classScoped: true,
      classContext: expect.objectContaining({ id: 'class-1', name: '10A' }),
    }));
  });
  it('imports rows into the selected class', () => {
    vi.mocked(isAdmin).mockReturnValue(true);
    vi.mocked(hasRole).mockReturnValue(false);
    vi.mocked(findClassById).mockReturnValue({
      id: 'class-1',
      name: '10A',
      grade: '10',
      academic_year_id: 'year-1',
    } as never);
    vi.mocked(findAllClasses).mockReturnValue([{
      id: 'class-1',
      name: '10A',
      grade: '10',
      academic_year_id: 'year-1',
    }] as never);
    vi.mocked(findAllNis).mockReturnValue([]);
    vi.mocked(parseStudentCsv).mockReturnValue({
      rows: [{ nis: '10011', name: 'Andi', class_name: '10A', phone: null, address: null }],
      errors: [],
    });
    const req = mockRequest({
      user: mockUser({ id: 'admin-1', roles: ['admin'] }),
      body: { class_id: 'class-1' },
    }) as NaraRequest & { file: { buffer: Buffer } };
    req.file = { buffer: Buffer.from('10011,Andi,,') };

    importStudentsFromCsv(req, mockResponse());

    expect(parseStudentCsv).toHaveBeenCalledWith(expect.any(String), expect.any(Set), expect.any(Set), '10A');
    expect(importStudents).toHaveBeenCalledWith([{
      nis: '10011',
      name: 'Andi',
      class_id: 'class-1',
      phone: null,
      address: null,
    }]);
    expect(findClassByName).not.toHaveBeenCalled();
  });
});
