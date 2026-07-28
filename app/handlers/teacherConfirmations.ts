import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError, queryString } from '@core';
import Logger from '@services/Logger';
import { findTeacherConfirmationById, findAllTeacherConfirmations, findConfirmationsByTeacher, createTeacherConfirmation, findTodayConfirmationBySchedule } from '@queries/teacherConfirmations';
import { findScheduleById } from '@queries/schedules';
import { findActiveSchoolLocation } from '@queries/schoolLocations';
import { isInsideRadius, validateCoordinates } from '@services/Geolocation';
import { saveConfirmationPhoto } from '@services/CameraUpload';
import { isAdmin, hasPermission } from '@queries/users';
import { TeacherConfirmationSchema, zodToErrors } from '@validators';
import type { TeacherConfirmation } from '@types';

const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'confirmations.view');

export const teacherConfirmationsPage = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return res.redirect('/login');
  const userId = req.user.id;
  const permissions = { canView: userId ? canView(userId) : false };
  const records = canView(userId) ? findAllTeacherConfirmations() : findConfirmationsByTeacher(userId);
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

  const schedule = findScheduleById(parsed.data.schedule_id);
  if (!schedule) return jsonError(res, 'Schedule not found', 404);

  // Only the assigned teacher or admin can confirm
  const isAssignedTeacher = schedule.teacher_user_id === req.user.id;
  if (!isAssignedTeacher && !canView(req.user.id)) {
    return jsonError(res, 'Forbidden', 403);
  }

  // Block duplicate confirmation for the same schedule today
  const existing = findTodayConfirmationBySchedule(schedule.id);
  if (existing) {
    return jsonError(res, 'Already confirmed for this schedule today', 409, 'DUPLICATE_CONFIRMATION');
  }

  // Validate and check geolocation
  const location = findActiveSchoolLocation();
  let isInside = false;
  let distanceMeters: number | null = null;
  let latitude: number | null = parsed.data.latitude ?? null;
  let longitude: number | null = parsed.data.longitude ?? null;

  if (location && latitude !== null && longitude !== null && validateCoordinates(latitude, longitude)) {
    distanceMeters = Math.round(isInsideRadius({ latitude, longitude }, { latitude: location.latitude, longitude: location.longitude }, location.radius_meters) ? 0 : 1);
    distanceMeters = Math.round(distanceMeters);
    isInside = isInsideRadius({ latitude, longitude }, { latitude: location.latitude, longitude: location.longitude }, location.radius_meters);
  }

  // Save photo
  let photoUrl = parsed.data.photo_url;
  try {
    if (photoUrl.startsWith('data:image')) {
      const upload = await saveConfirmationPhoto(photoUrl, req.user.id);
      photoUrl = upload.url;
    }
  } catch (error: unknown) {
    Logger.error('Failed to save confirmation photo', error as Error);
    return jsonServerError(res, 'Failed to save photo');
  }

  const data: Omit<TeacherConfirmation, 'id' | 'created_at'> = {
    schedule_id: parsed.data.schedule_id,
    teacher_user_id: req.user.id,
    photo_url: photoUrl,
    latitude,
    longitude,
    distance_meters: distanceMeters,
    is_inside_school: isInside ? 1 : 0,
    confirmed_at: Date.now(),
  };

  try {
    const item = createTeacherConfirmation(data);
    return jsonCreated(res, isInside ? 'Confirmation submitted' : 'Confirmation submitted but outside school area', item);
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
