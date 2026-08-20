import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError, queryString } from '@core';
import Logger from '@services/Logger';
import { findTeacherConfirmationById, findAllTeacherConfirmations, findAllTeacherConfirmationLogs, findConfirmationsByTeacher, createTeacherConfirmation, findTodayConfirmationBySchedule, findTodayConfirmationByTeacher } from '@queries/teacherConfirmations';
import { findScheduleById } from '@queries/schedules';
import { findActiveSchoolLocation } from '@queries/schoolLocations';
import { haversineDistance, validateCoordinates } from '@services/Geolocation';
import { saveConfirmationPhoto } from '@services/CameraUpload';
import { isAdmin, hasPermission } from '@queries/users';
import { TeacherConfirmationSchema, zodToErrors } from '@validators';
import type { TeacherConfirmation } from '@types';

const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'confirmations.view');

export const teacherConfirmationsPage = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return res.redirect('/login');
  const userId = req.user.id;
  const permissions = { canView: userId ? canView(userId) : false };
  const records = canView(userId) ? findAllTeacherConfirmationLogs() : [];
  return res.inertia('teacherConfirmations', { permissions, records });
};

export const confirmPage = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return res.redirect('/login');

  const scheduleId = req.query.schedule_id as string | undefined;
  const schedule = scheduleId ? findScheduleById(scheduleId) : null;
  return res.inertia('teacher/confirm', { scheduleId: scheduleId || null, schedule });
};

export const listTeacherConfirmations = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id) && req.user.id !== req.query.teacher_user_id) return jsonError(res, 'Forbidden', 403);

  const teacherId = queryString(req, 'teacher_user_id');
  const data = teacherId ? findConfirmationsByTeacher(teacherId) : [];
  return jsonSuccess(res, 'OK', data);
};

export const teacherConfirmationData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const item = findTeacherConfirmationById(req.params.id || '');
  if (!item) return jsonError(res, 'Not found', 404);
  if (!canView(req.user.id) && item.teacher_user_id !== req.user.id) return jsonError(res, 'Forbidden', 403);

  return jsonSuccess(res, 'OK', item);
};

export const submitTeacherConfirmation = async (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const parsed = TeacherConfirmationSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  // QR flow: schedule_id optional, photo optional
  // Legacy flow: schedule_id required, photo required
  const scheduleId = parsed.data.schedule_id ?? null;
  if (scheduleId) {
    const schedule = findScheduleById(scheduleId);
    if (!schedule) return jsonError(res, 'Schedule not found', 404);
    // Only the assigned teacher or admin can confirm per-schedule
    const isAssignedTeacher = schedule.teacher_user_id === req.user.id;
    if (!isAssignedTeacher && !canView(req.user.id)) {
      return jsonError(res, 'Forbidden', 403);
    }
    // Block duplicate per-schedule today
    const existing = findTodayConfirmationBySchedule(schedule.id);
    if (existing) {
      return jsonError(res, 'Already confirmed for this schedule today', 409, 'DUPLICATE_CONFIRMATION');
    }
  } else {
    // QR flow: block duplicate per-teacher today
    const existingToday = findTodayConfirmationByTeacher(req.user.id);
    if (existingToday) {
      return jsonError(res, 'Sudah konfirmasi kehadiran hari ini', 409, 'DUPLICATE_CONFIRMATION');
    }
  }

  // Geolocation (optional in QR flow, kept for backward compatibility)
  const location = findActiveSchoolLocation();
  let isInside = false;
  let distanceMeters: number | null = null;
  let latitude: number | null = parsed.data.latitude ?? null;
  let longitude: number | null = parsed.data.longitude ?? null;

  if (location && latitude !== null && longitude !== null && validateCoordinates(latitude, longitude)
      && location.latitude !== null && location.longitude !== null && location.radius_meters !== null) {
    distanceMeters = Math.round(haversineDistance({ latitude, longitude }, { latitude: location.latitude, longitude: location.longitude }));
    isInside = distanceMeters <= location.radius_meters;
  }

  // Save photo (optional in QR flow)
  let photoUrl: string | null = parsed.data.photo_url ?? null;
  if (photoUrl && photoUrl.startsWith('data:image')) {
    try {
      const upload = await saveConfirmationPhoto(photoUrl, req.user.id);
      photoUrl = upload.url;
    } catch (error: unknown) {
      Logger.error('Failed to save confirmation photo', error as Error);
      return jsonServerError(res, 'Failed to save photo');
    }
  }

  // Compute start-of-day for confirmation_date
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const data: Omit<TeacherConfirmation, 'id' | 'created_at'> = {
    schedule_id: scheduleId,
    teacher_user_id: req.user.id,
    photo_url: photoUrl,
    latitude,
    longitude,
    distance_meters: distanceMeters,
    is_inside_school: isInside ? 1 : 0,
    confirmation_date: startOfDay.getTime(),
    confirmed_at: Date.now(),
  };

  try {
    const item = createTeacherConfirmation(data);
    return jsonCreated(res, 'Konfirmasi kehadiran tercatat', item);
  } catch (error: unknown) {
    Logger.error('Failed to create teacher confirmation', error as Error);
    return jsonServerError(res, 'Failed to create confirmation');
  }
};

export const outsideConfirmationsData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'confirmations.view')) return jsonError(res, 'Forbidden', 403);

  const data = findConfirmationsByTeacher(req.query.teacher_user_id as string || '').filter(c => c.is_inside_school === 0);
  return jsonSuccess(res, 'OK', data);
};
