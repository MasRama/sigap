import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError, jsonPaginated, queryInt, queryString } from '@core';
import Logger from '@services/Logger';
import { getTeachersPaginated, findTeacherById, findTeacherByUserId, createTeacher, updateTeacher, deleteTeacher, getTeacherSubjects, syncTeacherSubjects } from '@queries/teachers';
import { isAdmin, hasPermission } from '@queries/users';
import { TeacherSchema, UpdateTeacherSchema, zodToErrors } from '@validators';

const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'teachers.view');
const canManage = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'teachers.create');

export const teachersPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  const permissions = {
    canView: userId ? canView(userId) : false,
    canCreate: userId ? canManage(userId) : false,
    canEdit: userId ? isAdmin(userId) || hasPermission(userId, 'teachers.edit') : false,
    canDelete: userId ? isAdmin(userId) || hasPermission(userId, 'teachers.delete') : false,
  };
  return res.inertia('teachers', { permissions });
};

export const listTeachers = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const page = queryInt(req, 'page', 1);
  const limit = queryInt(req, 'limit', 10);
  const search = queryString(req, 'search');

  const { data, total } = getTeachersPaginated(page, limit, search);
  const totalPages = Math.ceil(total / limit);
  return jsonPaginated(res, 'OK', data, { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 });
};

export const teacherData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const item = findTeacherById(req.params.id || '');
  if (!item) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'OK', { ...item, subjects: getTeacherSubjects(item.id) });
};

export const teacherByUser = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  const item = findTeacherByUserId(req.params.userId || '');
  if (!item) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'OK', { ...item, subjects: getTeacherSubjects(item.id) });
};

export const addTeacher = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canManage(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const parsed = TeacherSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = createTeacher({
      user_id: parsed.data.user_id,
      employee_id: parsed.data.employee_id ?? null,
      phone: parsed.data.phone ?? null,
    });
    return jsonCreated(res, 'Teacher created', item);
  } catch (error: unknown) {
    Logger.error('Failed to create teacher', error as Error);
    return jsonServerError(res, 'Failed to create teacher');
  }
};

export const editTeacher = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'teachers.edit')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const parsed = UpdateTeacherSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = updateTeacher(id, parsed.data);
    if (!item) return jsonError(res, 'Not found', 404);
    return jsonSuccess(res, 'Teacher updated', item);
  } catch (error: unknown) {
    Logger.error('Failed to update teacher', error as Error);
    return jsonServerError(res, 'Failed to update teacher');
  }
};

export const removeTeacher = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'teachers.delete')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const ok = deleteTeacher(id);
  if (!ok) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'Teacher deleted');
};

export const assignTeacherSubjects = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'teachers.edit')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  const { subject_ids: subjectIds, academic_year_id: academicYearId } = req.body || {};
  if (!id || !Array.isArray(subjectIds) || !academicYearId) {
    return jsonError(res, 'Teacher ID, subject IDs, and academic year ID are required', 400);
  }

  try {
    syncTeacherSubjects(id, subjectIds as string[], academicYearId as string);
    return jsonSuccess(res, 'Subjects assigned');
  } catch (error: unknown) {
    Logger.error('Failed to assign subjects', error as Error);
    return jsonServerError(res, 'Failed to assign subjects');
  }
};
