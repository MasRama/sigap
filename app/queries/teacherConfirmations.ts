import SQLite from '@services/SQLite';
import type { TeacherConfirmation, TeacherConfirmationLogView } from '@types';
import { randomUUID } from 'crypto';

export const findAllTeacherConfirmations = (): TeacherConfirmation[] =>
  SQLite.many<TeacherConfirmation>`SELECT * FROM teacher_confirmations ORDER BY confirmed_at DESC`;

export const findAllTeacherConfirmationLogs = (): TeacherConfirmationLogView[] =>
  SQLite.many<TeacherConfirmationLogView>`
    SELECT tc.id,
           COALESCE(u.name, u.username) AS teacher_name,
           u.username AS teacher_username,
           COALESCE(tc.confirmation_date, tc.confirmed_at) AS confirmation_date,
           tc.confirmed_at
    FROM teacher_confirmations tc
    INNER JOIN users u ON u.id = tc.teacher_user_id
    ORDER BY tc.confirmed_at DESC
  `;

export const findTeacherConfirmationById = (id: string): TeacherConfirmation | undefined =>
  SQLite.one<TeacherConfirmation>`SELECT * FROM teacher_confirmations WHERE id = ${id}`;

export const findConfirmationsByTeacher = (teacherUserId: string): TeacherConfirmation[] =>
  SQLite.many<TeacherConfirmation>`SELECT * FROM teacher_confirmations WHERE teacher_user_id = ${teacherUserId} ORDER BY confirmed_at DESC`;

export const findConfirmationsBySchedule = (scheduleId: string): TeacherConfirmation[] =>
  SQLite.many<TeacherConfirmation>`SELECT * FROM teacher_confirmations WHERE schedule_id = ${scheduleId} ORDER BY confirmed_at DESC`;

export const findTodayConfirmationBySchedule = (scheduleId: string): TeacherConfirmation | undefined => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return SQLite.one<TeacherConfirmation>`
    SELECT * FROM teacher_confirmations
    WHERE schedule_id = ${scheduleId}
      AND confirmed_at >= ${startOfDay.getTime()}
      AND confirmed_at <= ${endOfDay.getTime()}
    ORDER BY confirmed_at DESC
    LIMIT 1
  `;
};

export const findTodayConfirmationByTeacher = (teacherUserId: string): TeacherConfirmation | undefined => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return SQLite.one<TeacherConfirmation>`
    SELECT * FROM teacher_confirmations
    WHERE teacher_user_id = ${teacherUserId}
      AND confirmed_at >= ${startOfDay.getTime()}
      AND confirmed_at <= ${endOfDay.getTime()}
    ORDER BY confirmed_at DESC
    LIMIT 1
  `;
};

export const createTeacherConfirmation = (data: Omit<TeacherConfirmation, 'id' | 'created_at'>): TeacherConfirmation => {
  const now = Date.now();
  const id = randomUUID();
  SQLite.exec`
    INSERT INTO teacher_confirmations (
      id, schedule_id, teacher_user_id, photo_url, latitude, longitude, distance_meters, is_inside_school, confirmation_date, confirmed_at, created_at
    ) VALUES (
      ${id}, ${data.schedule_id ?? null}, ${data.teacher_user_id}, ${data.photo_url ?? null}, ${data.latitude ?? null}, ${data.longitude ?? null}, ${data.distance_meters ?? null}, ${data.is_inside_school ?? 1}, ${data.confirmation_date ?? null}, ${data.confirmed_at}, ${now}
    )
  `;
  return findTeacherConfirmationById(id)!;
};

export const updateTeacherConfirmation = (id: string, data: Partial<Omit<TeacherConfirmation, 'id'>>): TeacherConfirmation | undefined => {
  SQLite.update('teacher_confirmations', { id }, data);
  return findTeacherConfirmationById(id);
};

export const deleteTeacherConfirmation = (id: string): boolean => {
  const result = SQLite.run('DELETE FROM teacher_confirmations WHERE id = ?', [id]);
  return result.changes > 0;
};
