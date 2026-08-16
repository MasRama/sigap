import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonError } from '@core';
import { findNotificationsByUser, getUnreadNotificationCount, markAllNotificationsRead } from '@queries/notifications';

export const notificationsData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  return jsonSuccess(res, 'OK', {
    unread: getUnreadNotificationCount(req.user.id),
    notifications: findNotificationsByUser(req.user.id, 10),
  });
};

export const markNotificationsRead = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  markAllNotificationsRead(req.user.id);
  return jsonSuccess(res, 'OK', { unread: 0 });
};
