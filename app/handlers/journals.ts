import type { NaraRequest, NaraResponse } from '@core';
import type { Journal } from '@types';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError } from '@core';
import Logger from '@services/Logger';
import { findAllJournals, findJournalById, findJournalsBySchedule, findJournalsByTeacher, createJournal, updateJournal, deleteJournal } from '@queries/journals';
import { findScheduleById } from '@queries/schedules';
import { findAttendanceByJournal } from '@queries/studentAttendance';
import { isAdmin, hasPermission } from '@queries/users';
import { isTeacherUser } from '@queries/teacherClassAssignments';
import { JournalSchema, UpdateJournalSchema, zodToErrors } from '@validators';

const isTeacherActor = (userId: string): boolean => !isAdmin(userId) && isTeacherUser(userId);
const canView = (userId: string): boolean => !isAdmin(userId) && hasPermission(userId, 'journals.view');
const canManage = (userId: string, permission: string): boolean =>
  isTeacherActor(userId) && hasPermission(userId, permission);

export const journalsPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  const permissions = {
    canView: userId ? canView(userId) : false,
    canCreate: userId ? canManage(userId, 'journals.create') : false,
    canEdit: userId ? canManage(userId, 'journals.edit') : false,
    canDelete: userId ? canManage(userId, 'journals.delete') : false,
  };
  return res.inertia('journals', { permissions });
};

export const listJournals = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const userId = req.user.id;
  const scheduleId = req.query.schedule_id as string | undefined;
  let data: Journal[] = [];

  if (scheduleId) {
    const schedule = findScheduleById(scheduleId);
    if (!schedule) return jsonError(res, 'Schedule not found', 404);
    if (isTeacherActor(userId) && schedule.teacher_user_id !== userId) {
      return jsonError(res, 'Forbidden', 403);
    }
    if (!canView(userId)) return jsonError(res, 'Forbidden', 403);
    data = findJournalsBySchedule(scheduleId);
  } else if (canView(userId) && !isTeacherUser(userId)) {
    data = findAllJournals();
  } else if (isTeacherActor(userId) && canView(userId)) {
    data = findJournalsByTeacher(userId);
  } else {
    return jsonError(res, 'Forbidden', 403);
  }

  return jsonSuccess(res, 'OK', data);
};

export const journalData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const item = findJournalById(req.params.id || '');
  if (!item) return jsonError(res, 'Not found', 404);

  const schedule = findScheduleById(item.schedule_id);
  if ((!canView(req.user.id) || isTeacherActor(req.user.id)) && schedule?.teacher_user_id !== req.user.id) {
    return jsonError(res, 'Forbidden', 403);
  }

  return jsonSuccess(res, 'OK', { ...item, attendance: findAttendanceByJournal(item.id) });
};

export const addJournal = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const parsed = JournalSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  const schedule = findScheduleById(parsed.data.schedule_id);
  if (!schedule) return jsonError(res, 'Schedule not found', 404);

  const canCreate = canManage(req.user.id, 'journals.create') && schedule.teacher_user_id === req.user.id;
  if (!canCreate) return jsonError(res, 'Forbidden', 403);

  try {
    const item = createJournal(parsed.data);
    return jsonCreated(res, 'Journal created', item);
  } catch (error: unknown) {
    Logger.error('Failed to create journal', error as Error);
    return jsonServerError(res, 'Failed to create journal');
  }
};

export const editJournal = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const existing = findJournalById(id);
  if (!existing) return jsonError(res, 'Not found', 404);

  const schedule = findScheduleById(existing.schedule_id);
  const canEdit = canManage(req.user.id, 'journals.edit') && schedule?.teacher_user_id === req.user.id;
  if (!canEdit) return jsonError(res, 'Forbidden', 403);

  const parsed = UpdateJournalSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = updateJournal(id, parsed.data);
    if (!item) return jsonError(res, 'Not found', 404);
    return jsonSuccess(res, 'Journal updated', item);
  } catch (error: unknown) {
    Logger.error('Failed to update journal', error as Error);
    return jsonServerError(res, 'Failed to update journal');
  }
};

export const removeJournal = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const existing = findJournalById(id);
  if (!existing) return jsonError(res, 'Not found', 404);

  const schedule = findScheduleById(existing.schedule_id);
  const canDelete = canManage(req.user.id, 'journals.delete') && schedule?.teacher_user_id === req.user.id;
  if (!canDelete) return jsonError(res, 'Forbidden', 403);

  try {
    const ok = deleteJournal(id);
    if (!ok) return jsonError(res, 'Not found', 404);
    return jsonSuccess(res, 'Journal deleted');
  } catch (error: unknown) {
    Logger.error('Failed to delete journal', error as Error);
    return jsonServerError(res, 'Failed to delete journal');
  }
};
