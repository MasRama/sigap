import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError, queryString, isUniqueConstraintError } from '@core';
import Logger from '@services/Logger';
import { findTeacherConfirmationById, findAllTeacherConfirmations, findAllTeacherConfirmationLogs, findConfirmationsByTeacher, createTeacherConfirmation, findTodayConfirmationByTeacher } from '@queries/teacherConfirmations';
import { findScheduleById } from '@queries/schedules';
import { findActiveSchoolLocation } from '@queries/schoolLocations';
import { haversineDistance, validateCoordinates } from '@services/Geolocation';
import { saveConfirmationPhoto } from '@services/CameraUpload';
import { verifyQrToken } from '@services/QrCode';
import { isAdmin, hasPermission } from '@queries/users';
import { isTeacherUser } from '@queries/teacherClassAssignments';
import { TeacherConfirmationSchema, zodToErrors } from '@validators';
import type { TeacherConfirmation } from '@types';

const isTeacherActor = (userId: string): boolean => !isAdmin(userId) && isTeacherUser(userId);
const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'confirmations.view');

export const teacherConfirmationsPage = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return res.redirect('/login');
  const userId = req.user.id;
  const permissions = { canView: canView(userId) };
  const records = canView(userId)
    ? (isTeacherActor(userId) ? findConfirmationsByTeacher(userId) : findAllTeacherConfirmationLogs())
    : [];
  return res.inertia('teacherConfirmations', { permissions, records });
};

export const confirmPage = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return res.redirect('/login');
  if (!isTeacherActor(req.user.id) || !hasPermission(req.user.id, 'confirmations.create')) {
    return res.redirect('/dashboard');
  }

  const scheduleId = typeof req.query.schedule_id === 'string' ? req.query.schedule_id : undefined;
  const schedule = scheduleId ? findScheduleById(scheduleId) : null;
  if (schedule && schedule.teacher_user_id !== req.user.id) return res.redirect('/dashboard');

  const qrToken = typeof req.query.qr_token === 'string' ? req.query.qr_token : null;
  const qrStatus = qrToken ? verifyQrToken(qrToken) : null;
  return res.inertia('teacher/confirm', {
    scheduleId: scheduleId || null,
    schedule,
    qrToken,
    qrTokenValid: !!qrStatus?.valid && !qrStatus.expired,
    qrTokenExpired: !!qrStatus?.expired,
    alreadyConfirmed: !!findTodayConfirmationByTeacher(req.user.id),
  });
};

export const listTeacherConfirmations = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const teacherId = queryString(req, 'teacher_user_id');
  const isOversight = canView(req.user.id) && !isTeacherActor(req.user.id);
  const isOwn = isTeacherActor(req.user.id) && teacherId === req.user.id;
  if (!isOversight && !isOwn) return jsonError(res, 'Forbidden', 403);

  const data = teacherId ? findConfirmationsByTeacher(teacherId) : findAllTeacherConfirmations();
  return jsonSuccess(res, 'OK', data);
};

export const teacherConfirmationData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const item = findTeacherConfirmationById(req.params.id || '');
  if (!item) return jsonError(res, 'Not found', 404);
  const isOversight = canView(req.user.id) && !isTeacherActor(req.user.id);
  const isOwn = isTeacherActor(req.user.id) && item.teacher_user_id === req.user.id;
  if (!isOversight && !isOwn) return jsonError(res, 'Forbidden', 403);

  return jsonSuccess(res, 'OK', item);
};

export const submitTeacherConfirmation = async (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isTeacherActor(req.user.id) || !hasPermission(req.user.id, 'confirmations.create')) {
    return jsonError(res, 'Forbidden', 403);
  }

  const parsed = TeacherConfirmationSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  const qrToken = parsed.data.qr_token;
  if (!qrToken) return jsonError(res, 'Silakan scan QR absen sekolah terlebih dahulu', 403, 'QR_TOKEN_REQUIRED');
  const qrStatus = verifyQrToken(qrToken);
  if (!qrStatus.valid) return jsonError(res, 'QR absen tidak valid', 403, 'INVALID_QR_TOKEN');
  if (qrStatus.expired) return jsonError(res, 'QR absen sudah kedaluwarsa', 403, 'EXPIRED_QR_TOKEN');

  const existingToday = findTodayConfirmationByTeacher(req.user.id);
  if (existingToday) {
    return jsonError(res, 'Anda sudah konfirmasi kehadiran hari ini', 409, 'DUPLICATE_CONFIRMATION');
  }

  const scheduleId = parsed.data.schedule_id ?? null;
  if (scheduleId) {
    const schedule = findScheduleById(scheduleId);
    if (!schedule) return jsonError(res, 'Schedule not found', 404);
    if (schedule.teacher_user_id !== req.user.id) return jsonError(res, 'Forbidden', 403);
  }

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
    if (isUniqueConstraintError(error)) {
      return jsonError(res, 'Anda sudah konfirmasi kehadiran hari ini', 409, 'DUPLICATE_CONFIRMATION');
    }
    Logger.error('Failed to create teacher confirmation', error as Error);
    return jsonServerError(res, 'Failed to create confirmation');
  }
};

export const outsideConfirmationsData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const teacherId = queryString(req, 'teacher_user_id');
  if (isTeacherActor(req.user.id) && teacherId && teacherId !== req.user.id) {
    return jsonError(res, 'Forbidden', 403);
  }
  const data = (isTeacherActor(req.user.id)
    ? findConfirmationsByTeacher(req.user.id)
    : teacherId ? findConfirmationsByTeacher(teacherId) : findAllTeacherConfirmations())
    .filter(c => c.is_inside_school === 0);
  return jsonSuccess(res, 'OK', data);
};
