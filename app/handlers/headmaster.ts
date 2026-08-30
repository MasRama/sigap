import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonError } from '@core';
import { getDashboardStats } from '@queries/stats';
import { getTodaySessions, getMissedSessions, getJournalCompleteness, getGradeProgress, getOutsideConfirmations } from '@queries/headmaster';
import { findActiveSchoolLocation } from '@queries/schoolLocations';
import { findAllTeacherConfirmations } from '@queries/teacherConfirmations';
import { hasPermission } from '@queries/users';

const isHeadmaster = (userId: string): boolean =>
  hasPermission(userId, 'headmaster.view');

export const headmasterDashboardPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  return res.inertia('headmaster/dashboard', { canView: userId ? isHeadmaster(userId) : false });
};

export const headmasterDashboardData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isHeadmaster(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const today = getTodaySessions();
  return jsonSuccess(res, 'OK', {
    stats: getDashboardStats(),
    today,
    confirmedToday: today.filter(s => s.confirmed).length,
    missed: getMissedSessions(),
    journals: getJournalCompleteness(),
    progress: getGradeProgress(),
  });
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

  return jsonSuccess(res, 'OK', {
    activeLocation: location,
    total: all.length,
    outside: getOutsideConfirmations(),
  });
};
