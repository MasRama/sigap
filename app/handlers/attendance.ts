import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonError } from '@core';
import { findAttendanceByStudent } from '@queries/studentAttendance';
import { findStudentById } from '@queries/students';
import { isAdmin, hasPermission } from '@queries/users';

export const attendanceReportData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (isAdmin(req.user.id) || !hasPermission(req.user.id, 'attendance.view')) {
    return jsonError(res, 'Forbidden', 403);
  }

  const student = findStudentById(req.params.studentId || '');
  if (!student) return jsonError(res, 'Student not found', 404);

  const records = findAttendanceByStudent(student.id);
  const present = records.filter(r => r.status === 'present').length;
  const sick = records.filter(r => r.status === 'sick').length;
  const leave = records.filter(r => r.status === 'leave').length;
  const absent = records.filter(r => r.status === 'absent').length;

  return jsonSuccess(res, 'OK', {
    student: { id: student.id, name: student.name, nis: student.nis },
    total: records.length,
    present,
    sick,
    leave,
    absent,
    records,
  });
};
