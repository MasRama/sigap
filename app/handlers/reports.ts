import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonError } from '@core';
import { getClassSubjectStats } from '@queries/stats';
import { isAdmin, hasPermission } from '@queries/users';

export const classSubjectReport = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (isAdmin(req.user.id) || (!hasPermission(req.user.id, 'grades.view') && !hasPermission(req.user.id, 'attendance.view'))) {
    return jsonError(res, 'Forbidden', 403);
  }

  const { class_id, subject_id } = req.query;
  if (!class_id || !subject_id) {
    return jsonError(res, 'Class and subject are required', 400);
  }

  const stats = getClassSubjectStats(class_id as string, subject_id as string);
  return jsonSuccess(res, 'OK', stats);
};
