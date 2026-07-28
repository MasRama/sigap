import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonError } from '@core';
import { findSchedulesByTeacher, findScheduleById } from '@queries/schedules';
import { findTodayConfirmationBySchedule } from '@queries/teacherConfirmations';
import { isAdmin, hasPermission } from '@queries/users';

const isTeacher = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'schedules.view');

export const teacherSchedulePage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  return res.inertia('teacherSchedule', { isTeacher: userId ? isTeacher(userId) : false });
};

export const listTodaySchedules = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const userId = req.user.id;
  const dayOfWeek = new Date().getDay();
  const schedules = findSchedulesByTeacher(userId).filter(s => s.day_of_week === dayOfWeek);

  const data = schedules.map(s => ({
    ...s,
    confirmed: !!findTodayConfirmationBySchedule(s.id),
  }));

  return jsonSuccess(res, 'OK', data);
};

export const todayScheduleDetail = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const schedule = findScheduleById(req.params.id || '');
  if (!schedule) return jsonError(res, 'Not found', 404);

  if (schedule.teacher_user_id !== req.user.id && !isAdmin(req.user.id) && !hasPermission(req.user.id, 'schedules.view')) {
    return jsonError(res, 'Forbidden', 403);
  }

  const confirmation = findTodayConfirmationBySchedule(schedule.id);
  return jsonSuccess(res, 'OK', { schedule, confirmed: !!confirmation });
};
