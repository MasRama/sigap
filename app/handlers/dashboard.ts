import type { NaraRequest, NaraResponse } from '@core';
import { getDashboardStats } from '@queries/stats';
import { findAllAcademicYears, findActiveAcademicYear } from '@queries/academicYears';
import { findAllClasses } from '@queries/classes';
import { findAllSubjects } from '@queries/subjects';
import { isAdmin, hasPermission } from '@queries/users';

export const dashboardPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  const canViewStudents = userId ? isAdmin(userId) || hasPermission(userId, 'students.view') : false;
  const canViewTeachers = userId ? isAdmin(userId) || hasPermission(userId, 'teachers.view') : false;

  const stats = canViewStudents ? getDashboardStats() : undefined;

  return res.inertia('dashboard', {
    stats,
    years: findAllAcademicYears(),
    activeYear: findActiveAcademicYear(),
    classes: canViewStudents ? findAllClasses() : [],
    subjects: canViewTeachers ? findAllSubjects() : [],
  });
};
