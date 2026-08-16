import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError } from '@core';
import Logger from '@services/Logger';
import { findAllAcademicYears, findAcademicYearById, createAcademicYear, updateAcademicYear, deleteAcademicYear, setActiveAcademicYear } from '@queries/academicYears';
import { findGradeComponentsByYear, upsertGradeComponents } from '@queries/gradeComponents';
import { isAdmin, hasPermission } from '@queries/users';
import { AcademicYearSchema, UpdateAcademicYearSchema, GradeComponentsSchema, zodToErrors } from '@validators';

const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'academic_years.view');
const canManage = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'academic_years.create');

export const academicYearsPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  const canViewFlag = userId ? canView(userId) : false;
  const permissions = {
    canView: canViewFlag,
    canCreate: userId ? canManage(userId) : false,
    canEdit: userId ? isAdmin(userId) || hasPermission(userId, 'academic_years.edit') : false,
    canDelete: userId ? isAdmin(userId) || hasPermission(userId, 'academic_years.delete') : false,
    canPublish: userId ? isAdmin(userId) || hasPermission(userId, 'academic_years.edit') : false,
  };
  const years = canViewFlag ? findAllAcademicYears() : [];
  return res.inertia('academicYears', { permissions, years });
};

export const listAcademicYears = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const years = findAllAcademicYears();
  return jsonSuccess(res, 'OK', years);
};

export const activeAcademicYearData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const year = findAcademicYearById(req.params.id || '');
  if (!year) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'OK', year);
};

export const addAcademicYear = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canManage(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const parsed = AcademicYearSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const year = createAcademicYear({ ...parsed.data, is_active: parsed.data.is_active ?? 0, is_grades_published: parsed.data.is_grades_published ?? 0 });
    return jsonCreated(res, 'Academic year created', year);
  } catch (error: unknown) {
    Logger.error('Failed to create academic year', error as Error);
    return jsonServerError(res, 'Failed to create academic year');
  }
};

export const editAcademicYear = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'academic_years.edit')) {
    return jsonError(res, 'Forbidden', 403);
  }

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const parsed = UpdateAcademicYearSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const year = updateAcademicYear(id, parsed.data);
    if (!year) return jsonError(res, 'Not found', 404);
    return jsonSuccess(res, 'Academic year updated', year);
  } catch (error: unknown) {
    Logger.error('Failed to update academic year', error as Error);
    return jsonServerError(res, 'Failed to update academic year');
  }
};

export const removeAcademicYear = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'academic_years.delete')) {
    return jsonError(res, 'Forbidden', 403);
  }

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const ok = deleteAcademicYear(id);
  if (!ok) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'Academic year deleted');
};

export const activateAcademicYear = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'academic_years.edit')) {
    return jsonError(res, 'Forbidden', 403);
  }

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  if (!findAcademicYearById(id)) return jsonError(res, 'Not found', 404);
  setActiveAcademicYear(id);
  return jsonSuccess(res, 'Academic year activated');
};

export const gradeComponentsData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  if (!findAcademicYearById(id)) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'OK', findGradeComponentsByYear(id));
};

export const saveGradeComponents = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'academic_years.edit')) {
    return jsonError(res, 'Forbidden', 403);
  }

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  if (!findAcademicYearById(id)) return jsonError(res, 'Not found', 404);

  const parsed = GradeComponentsSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    upsertGradeComponents(id, parsed.data.components);
    return jsonSuccess(res, 'Grade components updated', findGradeComponentsByYear(id));
  } catch (error: unknown) {
    Logger.error('Failed to update grade components', error as Error);
    return jsonServerError(res, 'Failed to update grade components');
  }
};

export const toggleGradesPublication = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'academic_years.edit')) {
    return jsonError(res, 'Forbidden', 403);
  }

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const year = findAcademicYearById(id);
  if (!year) return jsonError(res, 'Not found', 404);

  const updated = updateAcademicYear(id, { is_grades_published: year.is_grades_published ? 0 : 1 });
  return jsonSuccess(res, updated?.is_grades_published ? 'Grades published' : 'Grades unpublished', updated);
};
