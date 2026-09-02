import { describe, expect, it, vi, beforeEach } from 'vitest';
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

import { addStudent, editStudent, listStudents, removeStudent, studentData } from '../../app/handlers/students';
import { createStudent, deleteStudent, findStudentById, getStudentsPaginated, updateStudent } from '@queries/students';

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
});
