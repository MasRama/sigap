import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError } from '@core';
import Logger from '@services/Logger';
import { findAllSubjects, findSubjectById, findSubjectByCode, createSubject, updateSubject, deleteSubject } from '@queries/subjects';
import { isAdmin, hasPermission } from '@queries/users';
import { SubjectSchema, UpdateSubjectSchema, zodToErrors } from '@validators';

const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'subjects.view');
const canManage = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'subjects.create');

export const subjectsPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  const canViewFlag = userId ? canView(userId) : false;
  const permissions = {
    canView: canViewFlag,
    canCreate: userId ? canManage(userId) : false,
    canEdit: userId ? isAdmin(userId) || hasPermission(userId, 'subjects.edit') : false,
    canDelete: userId ? isAdmin(userId) || hasPermission(userId, 'subjects.delete') : false,
  };
  const subjects = canViewFlag ? findAllSubjects() : [];
  return res.inertia('subjects', { permissions, subjects });
};

export const listSubjects = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);
  return jsonSuccess(res, 'OK', findAllSubjects());
};

export const subjectData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const item = findSubjectById(req.params.id || '');
  if (!item) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'OK', item);
};

export const addSubject = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canManage(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const parsed = SubjectSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = createSubject(parsed.data);
    return jsonCreated(res, 'Subject created', item);
  } catch (error: unknown) {
    Logger.error('Failed to create subject', error as Error);
    return jsonServerError(res, 'Failed to create subject');
  }
};

export const editSubject = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'subjects.edit')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const parsed = UpdateSubjectSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = updateSubject(id, parsed.data);
    if (!item) return jsonError(res, 'Not found', 404);
    return jsonSuccess(res, 'Subject updated', item);
  } catch (error: unknown) {
    Logger.error('Failed to update subject', error as Error);
    return jsonServerError(res, 'Failed to update subject');
  }
};

export const removeSubject = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'subjects.delete')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const ok = deleteSubject(id);
  if (!ok) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'Subject deleted');
};
