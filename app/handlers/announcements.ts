import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError } from '@core';
import Logger from '@services/Logger';
import { findAllAnnouncements, findLatestAnnouncements, findAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@queries/announcements';
import { isAdmin } from '@queries/users';
import { AnnouncementSchema, UpdateAnnouncementSchema, zodToErrors } from '@validators';

export const announcementsPage = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return res.redirect('/login');

  const canManage = isAdmin(req.user.id);
  return res.inertia('announcements', {
    canManage,
    announcements: canManage ? findAllAnnouncements() : [],
  });
};

export const listAnnouncements = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  return jsonSuccess(res, 'OK', findAllAnnouncements());
};

export const latestAnnouncementsData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  return jsonSuccess(res, 'OK', findLatestAnnouncements(3));
};

export const addAnnouncement = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const parsed = AnnouncementSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = createAnnouncement({ ...parsed.data, author_user_id: req.user.id });
    return jsonCreated(res, 'Announcement created', item);
  } catch (error: unknown) {
    Logger.error('Failed to create announcement', error as Error);
    return jsonServerError(res, 'Failed to create announcement');
  }
};

export const editAnnouncement = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const parsed = UpdateAnnouncementSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = updateAnnouncement(id, parsed.data);
    if (!item) return jsonError(res, 'Not found', 404);
    return jsonSuccess(res, 'Announcement updated', item);
  } catch (error: unknown) {
    Logger.error('Failed to update announcement', error as Error);
    return jsonServerError(res, 'Failed to update announcement');
  }
};

export const removeAnnouncement = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const ok = deleteAnnouncement(id);
  if (!ok) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'Announcement deleted');
};
