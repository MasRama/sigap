import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError } from '@core';
import Logger from '@services/Logger';
import { findAllJournals, findJournalById, findJournalsBySchedule, findJournalsByTeacher, createJournal, updateJournal, deleteJournal } from '@queries/journals';
import { findScheduleById } from '@queries/schedules';
import { findAttendanceByJournal } from '@queries/studentAttendance';
import { isAdmin, hasPermission } from '@queries/users';
import { JournalSchema, UpdateJournalSchema, zodToErrors } from '@validators';

const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'journals.view');

export const journalsPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  const permissions = {
    canView: userId ? canView(userId) : false,
    canCreate: userId ? isAdmin(userId) || hasPermission(userId, 'journals.create') : false,
    canEdit: userId ? isAdmin(userId) || hasPermission(userId, 'journals.edit') : false,
    canDelete: userId ? isAdmin(userId) || hasPermission(userId, 'journals.delete') : false,
  };
  return res.inertia('journals', { permissions });
};

export const listJournals = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const teacherId = req.user.id;
  const isViewer = canView(teacherId);

  const scheduleId = req.query.schedule_id as string | undefined;
  let data: ReturnType<typeof findAllJournals> = [];

  if (scheduleId) {
    data = findJournalsBySchedule(scheduleId);
  } else if (isViewer) {
    data = findAllJournals();
  } else {
    data = findJournalsByTeacher(teacherId);
  }

  return jsonSuccess(res, 'OK', data);
};

export const journalData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const item = findJournalById(req.params.id || '');
  if (!item) return jsonError(res, 'Not found', 404);

  const schedule = findScheduleById(item.schedule_id);
  if (!canView(req.user.id) && schedule?.teacher_user_id !== req.user.id) {
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

  const isTeacher = schedule.teacher_user_id === req.user.id;
  const canCreate = isAdmin(req.user.id) || hasPermission(req.user.id, 'journals.create');
  if (!isTeacher && !canCreate) return jsonError(res, 'Forbidden', 403);

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
  const canEdit = isAdmin(req.user.id) || hasPermission(req.user.id, 'journals.edit') || (schedule?.teacher_user_id === req.user.id);
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
  const canDelete = isAdmin(req.user.id) || hasPermission(req.user.id, 'journals.delete') || (schedule?.teacher_user_id === req.user.id);
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
