import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError, jsonPaginated, queryInt, queryString } from '@core';
import Logger from '@services/Logger';
import { getGradesPaginated, findGradeById, findGradesByStudent, createGrade, updateGrade, deleteGrade, getClassSubjectSummary } from '@queries/grades';
import { logGradeChange } from '@queries/gradeAuditLogs';
import { findAllStudents, findStudentsByTeacherUser } from '@queries/students';
import { findAllSubjects } from '@queries/subjects';
import { findAllClasses, findClassesByTeacherUser } from '@queries/classes';
import { findAllAcademicYears } from '@queries/academicYears';
import { isTeacherUser, isTeacherAssignedToClass, isTeacherAssignedToStudent } from '@queries/teacherClassAssignments';
import { isAdmin, hasPermission } from '@queries/users';
import { GradeSchema, zodToErrors } from '@validators';

const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'grades.view');
const canManageGradeInClass = (userId: string, permission: string, classId: string): boolean => {
  if (isAdmin(userId)) return true;
  if (!hasPermission(userId, permission)) return false;
  return !isTeacherUser(userId) || isTeacherAssignedToClass(userId, classId);
};
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

  const scopedTeacherUserId = userId && !isAdmin(userId) && isTeacherUser(userId) ? userId : undefined;
  const { data, total } = getGradesPaginated(page, limit, undefined, classId || undefined, subjectId || undefined, scopedTeacherUserId);
  const totalPages = Math.ceil(total / limit);
  const summaryAllowed = !!classId && !!subjectId && (!scopedTeacherUserId || isTeacherAssignedToClass(scopedTeacherUserId, classId));
  const summary = summaryAllowed ? getClassSubjectSummary(classId!, subjectId!) : null;

  return res.inertia('grades', {
    permissions,
    grades: data,
    students: scopedTeacherUserId ? findStudentsByTeacherUser(scopedTeacherUserId) : findAllStudents(),
    subjects: findAllSubjects(),
    classes: scopedTeacherUserId ? findClassesByTeacherUser(scopedTeacherUserId) : findAllClasses(),
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

  const scopedTeacherUserId = !isAdmin(req.user.id) && isTeacherUser(req.user.id) ? req.user.id : undefined;
  const { data, total } = getGradesPaginated(page, limit, studentId || undefined, classId || undefined, subjectId || undefined, scopedTeacherUserId);
  const totalPages = Math.ceil(total / limit);
  return jsonPaginated(res, 'OK', data, { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 });
};
export const gradesByStudent = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id) && req.user.id !== req.params.studentId) return jsonError(res, 'Forbidden', 403);

  const studentId = req.params.studentId;
  if (!studentId) return jsonError(res, 'Student ID required', 400);
  if (!isAdmin(req.user.id) && isTeacherUser(req.user.id) && !isTeacherAssignedToStudent(req.user.id, studentId)) {
    return jsonError(res, 'Forbidden', 403);
  }

  return jsonSuccess(res, 'OK', findGradesByStudent(studentId));
};

export const gradeData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const item = findGradeById(req.params.id || '');
  if (!item) return jsonError(res, 'Not found', 404);
  if (!isAdmin(req.user.id) && isTeacherUser(req.user.id) && !isTeacherAssignedToClass(req.user.id, item.class_id)) {
    return jsonError(res, 'Forbidden', 403);
  }
  return jsonSuccess(res, 'OK', item);
};

export const addGrade = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canManage(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const parsed = GradeSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));
  if (!canManageGradeInClass(req.user.id, 'grades.create', parsed.data.class_id)) {
    return jsonError(res, 'Forbidden', 403);
  }
  const teacherUserId = isAdmin(req.user.id) ? parsed.data.teacher_user_id ?? req.user.id : req.user.id;

  try {
    const item = createGrade({ ...parsed.data, teacher_user_id: teacherUserId });
    logGradeChange({
      grade_id: item.id,
      student_id: parsed.data.student_id,
      subject_id: parsed.data.subject_id,
      class_id: parsed.data.class_id,
      type: parsed.data.type,
      action: 'create',
      old_score: null,
      new_score: parsed.data.score,
      user_id: req.user.id,
    });
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
    const existing = findGradeById(id);
    if (!existing) return jsonError(res, 'Not found', 404);
    const targetClassId = parsed.data.class_id ?? existing.class_id;
    if (!canManageGradeInClass(req.user.id, 'grades.edit', targetClassId)) {
      return jsonError(res, 'Forbidden', 403);
    }
    const updateData = !isAdmin(req.user.id) && isTeacherUser(req.user.id)
      ? { ...parsed.data, teacher_user_id: undefined }
      : parsed.data;
    const item = updateGrade(id, updateData);
    if (!item) return jsonError(res, 'Not found', 404);
    logGradeChange({
      grade_id: item.id,
      student_id: item.student_id,
      subject_id: item.subject_id,
      class_id: item.class_id,
      type: item.type,
      action: 'update',
      old_score: existing.score,
      new_score: parsed.data.score ?? existing.score,
      user_id: req.user.id,
    });
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

  const existing = findGradeById(id);
  if (!existing) return jsonError(res, 'Not found', 404);
  if (!canManageGradeInClass(req.user.id, 'grades.delete', existing.class_id)) {
    return jsonError(res, 'Forbidden', 403);
  }

  const ok = deleteGrade(id);
  if (!ok) return jsonError(res, 'Not found', 404);
  logGradeChange({
    grade_id: existing.id,
    student_id: existing.student_id,
    subject_id: existing.subject_id,
    class_id: existing.class_id,
    type: existing.type,
    action: 'delete',
    old_score: existing.score,
    new_score: null,
    user_id: req.user.id,
  });
  return jsonSuccess(res, 'Grade deleted');
};
