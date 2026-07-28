import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonError } from '@core';
import { getDashboardStats } from '@queries/stats';
import { findAllSchoolLocations, findActiveSchoolLocation } from '@queries/schoolLocations';
import { findAllTeacherConfirmations } from '@queries/teacherConfirmations';
import { isAdmin, hasPermission } from '@queries/users';

const isHeadmaster = (userId: string): boolean =>
  isAdmin(userId) || hasPermission(userId, 'headmaster.view');

export const headmasterDashboardPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  return res.inertia('headmaster/dashboard', { canView: userId ? isHeadmaster(userId) : false });
};

export const headmasterDashboardData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isHeadmaster(req.user.id)) return jsonError(res, 'Forbidden', 403);

  return jsonSuccess(res, 'OK', getDashboardStats());
};

export const headmasterReportsPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  return res.inertia('headmaster/reports', { canView: userId ? isHeadmaster(userId) : false });
};

export const listOutsideConfirmations = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isHeadmaster(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const location = findActiveSchoolLocation();
  const all = findAllTeacherConfirmations();
  const outside = all.filter(c => c.is_inside_school === 0);

  return jsonSuccess(res, 'OK', {
    activeLocation: location,
    total: all.length,
    outside,
  });
};
