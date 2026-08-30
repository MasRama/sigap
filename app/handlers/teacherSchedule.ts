import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonError } from '@core';
import { findSchedulesByTeacher, findScheduleById } from '@queries/schedules';
import { findTodayConfirmationBySchedule } from '@queries/teacherConfirmations';
import { isAdmin, hasPermission } from '@queries/users';
import { isTeacherUser } from '@queries/teacherClassAssignments';

const isTeacherActor = (userId: string): boolean =>
  !isAdmin(userId) && isTeacherUser(userId) && hasPermission(userId, 'schedules.view');

export const teacherSchedulePage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  return res.inertia('teacher/schedule', { isTeacher: userId ? isTeacherActor(userId) : false });
};

export const listTodaySchedules = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isTeacherActor(req.user.id)) return jsonError(res, 'Forbidden', 403);

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

  if (!isTeacherActor(req.user.id) || schedule.teacher_user_id !== req.user.id) {
    return jsonError(res, 'Forbidden', 403);
  }

  const confirmation = findTodayConfirmationBySchedule(schedule.id);
  return jsonSuccess(res, 'OK', { schedule, confirmed: !!confirmation });
};
