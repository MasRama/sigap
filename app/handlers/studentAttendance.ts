import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError } from '@core';
import Logger from '@services/Logger';
import { findAttendanceByJournal, findAttendanceByStudent, createStudentAttendance, upsertStudentAttendance, deleteStudentAttendance } from '@queries/studentAttendance';
import { findJournalById } from '@queries/journals';
import { findScheduleById } from '@queries/schedules';
import { isAdmin, hasPermission } from '@queries/users';
import { StudentAttendanceSchema, zodToErrors } from '@validators';

const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'attendance.view');
const canManage = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'attendance.create');

export const studentAttendancePage = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return res.redirect('/login');
  const userId = req.user.id;
  const permissions = {
    canView: canView(userId),
    canCreate: canManage(userId),
    canEdit: isAdmin(userId) || hasPermission(userId, 'attendance.edit'),
    canDelete: isAdmin(userId) || hasPermission(userId, 'attendance.delete'),
  };
  const records = canView(userId) ? [] : findAttendanceByStudent('');
  return res.inertia('studentAttendance', { permissions, records });
};

export const listAttendanceByJournal = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const journal = findJournalById(req.params.journalId || '');
  if (!journal) return jsonError(res, 'Journal not found', 404);

  const schedule = findScheduleById(journal.schedule_id);
  const canAccess = canView(req.user.id) || schedule?.teacher_user_id === req.user.id;
  if (!canAccess) return jsonError(res, 'Forbidden', 403);

  return jsonSuccess(res, 'OK', findAttendanceByJournal(journal.id));
};

export const listAttendanceByStudent = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const studentId = req.params.studentId;
  if (!studentId) return jsonError(res, 'Student ID required', 400);

  // Parents can view their own children's attendance; teachers/admins can view any
  // Simplified: require view permission
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  return jsonSuccess(res, 'OK', findAttendanceByStudent(studentId));
};

export const saveAttendance = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const items = Array.isArray(req.body) ? req.body : [req.body];
  const results = [];

  for (const raw of items) {
    const parsed = StudentAttendanceSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));
    }

    const journal = findJournalById(parsed.data.journal_id);
    if (!journal) return jsonError(res, 'Journal not found', 404);

    const schedule = findScheduleById(journal.schedule_id);
    const canEdit = isAdmin(req.user.id) || hasPermission(req.user.id, 'attendance.edit') || schedule?.teacher_user_id === req.user.id;
    if (!canEdit) return jsonError(res, 'Forbidden', 403);

    try {
      const item = upsertStudentAttendance(parsed.data);
      results.push(item);
    } catch (error: unknown) {
      Logger.error('Failed to save attendance', error as Error);
      return jsonServerError(res, 'Failed to save attendance');
    }
  }

  return jsonCreated(res, 'Attendance saved', results);
};

export const removeAttendance = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'attendance.delete')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const ok = deleteStudentAttendance(id);
  if (!ok) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'Attendance record deleted');
};
