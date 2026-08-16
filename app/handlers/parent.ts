import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonError } from '@core';
import { findParentByUserId } from '@queries/parents';
import { findStudentsByParent, findStudentById } from '@queries/students';
import { findGradesByStudent, getStudentGradeSummaries, getGradesPublicationForStudent } from '@queries/grades';
import { findAttendanceByStudent } from '@queries/studentAttendance';

export const parentDashboardPage = (req: NaraRequest, res: NaraResponse) => {
  return res.inertia('parent/dashboard');
};

export const parentDashboardData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const parent = findParentByUserId(req.user.id);
  if (!parent) return jsonError(res, 'Parent profile not found', 404);

  const children = findStudentsByParent(parent.user_id);
  const summaries = children.map(child => {
    const published = getGradesPublicationForStudent(child.id);
    return {
      ...child,
      gradesPublished: published,
      grades: published ? findGradesByStudent(child.id).slice(0, 5) : [],
      attendance: findAttendanceByStudent(child.id).slice(0, 5),
    };
  });

  return jsonSuccess(res, 'OK', { parent, children: summaries });
};

export const childAttendanceData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const parent = findParentByUserId(req.user.id);
  if (!parent) return jsonError(res, 'Parent profile not found', 404);

  const studentId = req.params.studentId;
  if (!studentId) return jsonError(res, 'Student ID required', 400);

  const children = findStudentsByParent(parent.user_id);
  if (!children.some(c => c.id === studentId)) return jsonError(res, 'Forbidden', 403);

  return jsonSuccess(res, 'OK', findAttendanceByStudent(studentId));
};

export const parentGradesPage = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return res.redirect('/login');

  const parent = findParentByUserId(req.user.id);
  if (!parent) return res.redirect('/parent/dashboard');

  const studentId = req.params.studentId;
  if (!studentId) return res.redirect('/parent/dashboard');

  const children = findStudentsByParent(parent.user_id);
  if (!children.some(c => c.id === studentId)) return res.redirect('/parent/dashboard');

  const student = findStudentById(studentId);
  const { published, summaries } = getStudentGradeSummaries(studentId);

  return res.inertia('parent/grades', {
    studentName: student?.name ?? '',
    gradesPublished: published,
    summaries: published ? summaries : [],
  });
};
