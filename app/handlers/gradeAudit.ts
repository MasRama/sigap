import type { NaraRequest, NaraResponse } from '@core';
import { jsonError, jsonPaginated, queryInt } from '@core';
import { getGradeAuditLogsPaginated } from '@queries/gradeAuditLogs';
import { isAdmin, hasPermission } from '@queries/users';

const canViewAudit = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'grades.audit');

export const gradeAuditPage = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return res.redirect('/login');

  const page = queryInt(req, 'page', 1);
  const limit = queryInt(req, 'limit', 20);
  const canView = canViewAudit(req.user.id);

  if (!canView) {
    return res.inertia('gradeAudit', { canView: false, logs: [], meta: undefined });
  }

  const { data, total } = getGradeAuditLogsPaginated(page, limit);
  const totalPages = Math.ceil(total / limit);
  return res.inertia('gradeAudit', {
    canView: true,
    logs: data,
    meta: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  });
};

export const gradeAuditData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canViewAudit(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const page = queryInt(req, 'page', 1);
  const limit = queryInt(req, 'limit', 20);

  const { data, total } = getGradeAuditLogsPaginated(page, limit);
  const totalPages = Math.ceil(total / limit);
  return jsonPaginated(res, 'OK', data, { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 });
};
