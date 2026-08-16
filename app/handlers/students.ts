import type { NaraRequest, NaraResponse, NaraMiddleware } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError, jsonPaginated, queryInt, queryString } from '@core';
import Logger from '@services/Logger';
import multer from 'multer';
import { getStudentsPaginated, findStudentById, createStudent, updateStudent, deleteStudent, findStudentsByClass, findAllNis, importStudents } from '@queries/students';
import { findAllClasses, findClassByName } from '@queries/classes';
import { getUsersWithRole } from '@queries/roles';
import { parseStudentCsv } from '@services/StudentCsvParser';
import { isAdmin, hasPermission } from '@queries/users';
import { StudentSchema, UpdateStudentSchema, zodToErrors } from '@validators';

const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'students.view');
const canManage = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'students.create');

export const studentsPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  const canViewFlag = userId ? canView(userId) : false;
  const permissions = {
    canView: canViewFlag,
    canCreate: userId ? canManage(userId) : false,
    canEdit: userId ? isAdmin(userId) || hasPermission(userId, 'students.edit') : false,
    canDelete: userId ? isAdmin(userId) || hasPermission(userId, 'students.delete') : false,
  };

  if (!canViewFlag) {
    return res.inertia('students', { permissions, students: [], classes: [], parents: [], meta: undefined });
  }

  const page = queryInt(req, 'page', 1);
  const limit = queryInt(req, 'limit', 10);
  const search = queryString(req, 'search');
  const classId = queryString(req, 'class_id');

  const { data, total } = getStudentsPaginated(page, limit, search, classId || undefined);
  const totalPages = Math.ceil(total / limit);
  return res.inertia('students', {
    permissions,
    students: data,
    classes: findAllClasses(),
    parents: getUsersWithRole('parent'),
    meta: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  });
};

export const listStudents = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const page = queryInt(req, 'page', 1);
  const limit = queryInt(req, 'limit', 10);
  const search = queryString(req, 'search');
  const classId = queryString(req, 'class_id');

  const { data, total } = getStudentsPaginated(page, limit, search, classId || undefined);
  const totalPages = Math.ceil(total / limit);
  return jsonPaginated(res, 'OK', data, { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 });
};

export const studentsByClass = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const classId = req.params.id;
  if (!classId) return jsonError(res, 'Class ID required', 400);

  return jsonSuccess(res, 'OK', findStudentsByClass(classId));
};

export const studentData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const item = findStudentById(req.params.id || '');
  if (!item) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'OK', item);
};

export const addStudent = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canManage(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const parsed = StudentSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = createStudent({
      nis: parsed.data.nis,
      name: parsed.data.name,
      class_id: parsed.data.class_id,
      parent_user_id: parsed.data.parent_user_id ?? null,
      phone: parsed.data.phone ?? null,
      address: parsed.data.address ?? null,
    });
    return jsonCreated(res, 'Student created', item);
  } catch (error: unknown) {
    Logger.error('Failed to create student', error as Error);
    return jsonServerError(res, 'Failed to create student');
  }
};

export const editStudent = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'students.edit')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const parsed = UpdateStudentSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = updateStudent(id, parsed.data);
    if (!item) return jsonError(res, 'Not found', 404);
    return jsonSuccess(res, 'Student updated', item);
  } catch (error: unknown) {
    Logger.error('Failed to update student', error as Error);
    return jsonServerError(res, 'Failed to update student');
  }
};

export const removeStudent = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'students.delete')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const ok = deleteStudent(id);
  if (!ok) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'Student deleted');
};

const studentCsvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!['text/csv', 'application/vnd.ms-excel', 'text/plain'].includes(file.mimetype) && !file.originalname.endsWith('.csv')) {
      return cb(new Error('INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
});

export const importStudentsMiddleware = studentCsvUpload.single('file') as unknown as NaraMiddleware;

export const importStudentsFromCsv = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canManage(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const file = (req as NaraRequest & { file?: { buffer: Buffer } }).file;
  if (!file) return jsonError(res, 'CSV file is required', 400, 'FILE_REQUIRED');

  try {
    const csv = file.buffer.toString('utf-8');
    const classNames = new Set(findAllClasses().map(c => c.name));
    const existingNis = new Set(findAllNis());
    const parsed = parseStudentCsv(csv, classNames, existingNis);

    if (parsed.rows.length > 0) {
      importStudents(parsed.rows.map(row => ({
        nis: row.nis,
        name: row.name,
        class_id: findClassByName(row.class_name)!.id,
        phone: row.phone,
        address: row.address,
      })));
    }

    return jsonSuccess(res, 'Import finished', {
      inserted: parsed.rows.length,
      errors: parsed.errors,
    });
  } catch (error: unknown) {
    Logger.error('Failed to import students', error as Error);
    return jsonServerError(res, 'Failed to import students');
  }
};
