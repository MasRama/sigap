import type { NaraRequest, NaraResponse } from '@core';
import { findStudentById } from '@queries/students';
import { findParentByUserId } from '@queries/parents';
import { findStudentsByParent } from '@queries/students';
import { getStudentGradeSummaries, getStudentContext } from '@queries/grades';
import { findAttendanceByStudent } from '@queries/studentAttendance';
import { isAdmin, hasPermission } from '@queries/users';

export const raporPage = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return res.redirect('/login');

  const studentId = req.params.studentId;
  if (!studentId) return res.redirect('/dashboard');

  const isStaff = isAdmin(req.user.id) || hasPermission(req.user.id, 'grades.view');

  let ownsChild = false;
  if (!isStaff) {
    const parent = findParentByUserId(req.user.id);
    if (parent) {
      ownsChild = findStudentsByParent(parent.user_id).some(c => c.id === studentId);
    }
  }
  if (!isStaff && !ownsChild) return res.redirect('/dashboard');

  const student = findStudentById(studentId);
  if (!student) return res.redirect('/dashboard');

  const context = getStudentContext(studentId);
  const { published, summaries } = getStudentGradeSummaries(studentId);

  const attendance = findAttendanceByStudent(studentId);
  const attendanceCounts = {
    present: attendance.filter(a => a.status === 'present').length,
    sick: attendance.filter(a => a.status === 'sick').length,
    leave: attendance.filter(a => a.status === 'leave').length,
    absent: attendance.filter(a => a.status === 'absent').length,
  };

  return res.inertia('reports/rapor', {
    student: { name: student.name, nis: student.nis },
    className: context?.class_name ?? '',
    yearName: context?.year_name ?? '',
    isParent: !isStaff,
    gradesPublished: published,
    summaries: isStaff || published ? summaries : [],
    attendanceCounts,
  });
};
