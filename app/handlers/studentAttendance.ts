import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError } from '@core';
import Logger from '@services/Logger';
import { findAttendanceByJournal, findAttendanceByStudent, findStudentAttendanceById, upsertStudentAttendance, deleteStudentAttendance } from '@queries/studentAttendance';
import { findJournalById } from '@queries/journals';
import { findScheduleById } from '@queries/schedules';
import { isTeacherUser } from '@queries/teacherClassAssignments';
import { isAdmin, hasPermission, hasRole } from '@queries/users';
import { StudentAttendanceSchema, zodToErrors } from '@validators';

const isTeacherActor = (userId: string): boolean => !hasRole(userId, 'parent') && !isAdmin(userId) && isTeacherUser(userId);
const canView = (userId: string): boolean => !hasRole(userId, 'parent') && !isAdmin(userId) && hasPermission(userId, 'attendance.view');
export const studentAttendancePage = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return res.redirect('/login');
  const userId = req.user.id;
  const permissions = {
    canView: canView(userId),
    canCreate: isTeacherActor(userId) && hasPermission(userId, 'attendance.create'),
    canEdit: userId ? isTeacherActor(userId) && hasPermission(userId, 'attendance.edit') : false,
    canDelete: userId ? isTeacherActor(userId) && hasPermission(userId, 'attendance.delete') : false,
  };
  const records = canView(userId) ? [] : findAttendanceByStudent('');
  return res.inertia('studentAttendance', { permissions, records });
};

export const listAttendanceByJournal = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const journal = findJournalById(req.params.journalId || '');
  if (!journal) return jsonError(res, 'Journal not found', 404);

  const schedule = findScheduleById(journal.schedule_id);
  const canAccess = (canView(req.user.id) && !isTeacherActor(req.user.id)) ||
    (isTeacherActor(req.user.id) && schedule?.teacher_user_id === req.user.id);
  if (!canAccess) return jsonError(res, 'Forbidden', 403);

  return jsonSuccess(res, 'OK', findAttendanceByJournal(journal.id));
};

export const listAttendanceByStudent = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const studentId = req.params.studentId;
  if (!studentId) return jsonError(res, 'Student ID required', 400);

  // Parent attendance is served through the ownership-checked parent handler.
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
    const canEdit = isTeacherActor(req.user.id) &&
      hasPermission(req.user.id, 'attendance.edit') &&
      schedule?.teacher_user_id === req.user.id;
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

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);
  if (!isTeacherActor(req.user.id) || !hasPermission(req.user.id, 'attendance.delete')) {
    return jsonError(res, 'Forbidden', 403);
  }

  const existing = findStudentAttendanceById(id);
  if (!existing) return jsonError(res, 'Not found', 404);
  const journal = findJournalById(existing.journal_id);
  const schedule = journal ? findScheduleById(journal.schedule_id) : undefined;
  if (schedule?.teacher_user_id !== req.user.id) return jsonError(res, 'Forbidden', 403);

  const ok = deleteStudentAttendance(id);
  if (!ok) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'Attendance record deleted');
};
