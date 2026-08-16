import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError, jsonPaginated, queryInt, queryString } from '@core';
import Logger from '@services/Logger';
import { getGradesPaginated, findGradeById, findGradesByStudent, createGrade, updateGrade, deleteGrade, getClassSubjectSummary } from '@queries/grades';
import { findAllStudents } from '@queries/students';
import { findAllSubjects } from '@queries/subjects';
import { findAllClasses } from '@queries/classes';
import { findAllAcademicYears } from '@queries/academicYears';
import { isAdmin, hasPermission } from '@queries/users';
import { GradeSchema, zodToErrors } from '@validators';

const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'grades.view');
const canManage = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'grades.create');

export const gradesPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  const canViewFlag = userId ? canView(userId) : false;
  const permissions = {
    canView: canViewFlag,
    canCreate: userId ? canManage(userId) : false,
    canEdit: userId ? isAdmin(userId) || hasPermission(userId, 'grades.edit') : false,
    canDelete: userId ? isAdmin(userId) || hasPermission(userId, 'grades.delete') : false,
  };

  const page = queryInt(req, 'page', 1);
  const limit = queryInt(req, 'limit', 10);
  const classId = queryString(req, 'class_id');
  const subjectId = queryString(req, 'subject_id');

  if (!canViewFlag) {
    return res.inertia('grades', {
      permissions,
      grades: [], students: [], subjects: [], classes: [], years: [],
      meta: undefined, summary: null,
    });
  }

  const { data, total } = getGradesPaginated(page, limit, undefined, classId || undefined, subjectId || undefined);
  const totalPages = Math.ceil(total / limit);
  const summary = classId && subjectId ? getClassSubjectSummary(classId, subjectId) : null;

  return res.inertia('grades', {
    permissions,
    grades: data,
    students: findAllStudents(),
    subjects: findAllSubjects(),
    classes: findAllClasses(),
    years: findAllAcademicYears(),
    meta: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    summary,
    classId: classId ?? '',
    subjectId: subjectId ?? '',
  });
};

export const listGrades = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const page = queryInt(req, 'page', 1);
  const limit = queryInt(req, 'limit', 10);
  const studentId = queryString(req, 'student_id');
  const classId = queryString(req, 'class_id');
  const subjectId = queryString(req, 'subject_id');

  const { data, total } = getGradesPaginated(page, limit, studentId || undefined, classId || undefined, subjectId || undefined);
  const totalPages = Math.ceil(total / limit);
  return jsonPaginated(res, 'OK', data, { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 });
};

export const gradesByStudent = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id) && req.user.id !== req.params.studentId) return jsonError(res, 'Forbidden', 403);

  const studentId = req.params.studentId;
  if (!studentId) return jsonError(res, 'Student ID required', 400);

  return jsonSuccess(res, 'OK', findGradesByStudent(studentId));
};

export const gradeData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const item = findGradeById(req.params.id || '');
  if (!item) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'OK', item);
};

export const addGrade = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canManage(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const parsed = GradeSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = createGrade(parsed.data);
    return jsonCreated(res, 'Grade created', item);
  } catch (error: unknown) {
    Logger.error('Failed to create grade', error as Error);
    return jsonServerError(res, 'Failed to create grade');
  }
};

export const editGrade = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'grades.edit')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const parsed = GradeSchema.partial().safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = updateGrade(id, parsed.data);
    if (!item) return jsonError(res, 'Not found', 404);
    return jsonSuccess(res, 'Grade updated', item);
  } catch (error: unknown) {
    Logger.error('Failed to update grade', error as Error);
    return jsonServerError(res, 'Failed to update grade');
  }
};

export const removeGrade = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'grades.delete')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const ok = deleteGrade(id);
  if (!ok) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'Grade deleted');
};
