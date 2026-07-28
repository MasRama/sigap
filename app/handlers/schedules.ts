import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError } from '@core';
import Logger from '@services/Logger';
import { findAllSchedules, findScheduleById, findSchedulesByClass, findSchedulesByTeacher, createSchedule, updateSchedule, deleteSchedule } from '@queries/schedules';
import { isAdmin, hasPermission } from '@queries/users';
import { ScheduleSchema, UpdateScheduleSchema, zodToErrors } from '@validators';

const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'schedules.view');
const canManage = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'schedules.create');

export const schedulesPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  const permissions = {
    canView: userId ? canView(userId) : false,
    canCreate: userId ? canManage(userId) : false,
    canEdit: userId ? isAdmin(userId) || hasPermission(userId, 'schedules.edit') : false,
    canDelete: userId ? isAdmin(userId) || hasPermission(userId, 'schedules.delete') : false,
  };
  return res.inertia('schedules', { permissions });
};

export const listSchedules = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const classId = req.query.class_id as string | undefined;
  const teacherId = req.query.teacher_user_id as string | undefined;

  const data = classId ? findSchedulesByClass(classId) : teacherId ? findSchedulesByTeacher(teacherId) : findAllSchedules();
  return jsonSuccess(res, 'OK', data);
};

export const scheduleData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const item = findScheduleById(req.params.id || '');
  if (!item) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'OK', item);
};

export const addSchedule = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canManage(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const parsed = ScheduleSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = createSchedule(parsed.data);
    return jsonCreated(res, 'Schedule created', item);
  } catch (error: unknown) {
    Logger.error('Failed to create schedule', error as Error);
    return jsonServerError(res, 'Failed to create schedule');
  }
};

export const editSchedule = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'schedules.edit')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const parsed = UpdateScheduleSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = updateSchedule(id, parsed.data);
    if (!item) return jsonError(res, 'Not found', 404);
    return jsonSuccess(res, 'Schedule updated', item);
  } catch (error: unknown) {
    Logger.error('Failed to update schedule', error as Error);
    return jsonServerError(res, 'Failed to update schedule');
  }
};

export const removeSchedule = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'schedules.delete')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const ok = deleteSchedule(id);
  if (!ok) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'Schedule deleted');
};
