import SQLite from '@services/SQLite';
import type { TeacherClassAssignment } from '@types';
import { randomUUID } from 'crypto';

export interface TeacherClassAssignmentView extends TeacherClassAssignment {
  class_name: string;
  grade: string;
}

export const findTeacherClassAssignments = (teacherId: string, academicYearId: string): TeacherClassAssignmentView[] =>
  SQLite.many<TeacherClassAssignmentView>`
    SELECT tca.*, c.name AS class_name, c.grade
    FROM teacher_class_assignments tca
    INNER JOIN classes c ON c.id = tca.class_id
    WHERE tca.teacher_id = ${teacherId} AND tca.academic_year_id = ${academicYearId}
    ORDER BY c.grade, c.name
  `;

export const findTeacherClassAssignmentsByAcademicYear = (academicYearId: string): TeacherClassAssignment[] =>
  SQLite.many<TeacherClassAssignment>`
    SELECT * FROM teacher_class_assignments
    WHERE academic_year_id = ${academicYearId}
    ORDER BY teacher_id, is_homeroom DESC, class_id
  `;

export const isTeacherUser = (userId: string): boolean => {
  const row = SQLite.one<{ id: string }>`SELECT id FROM teachers WHERE user_id = ${userId}`;
  return !!row;
};

export const isTeacherAssignedToClass = (teacherUserId: string, classId: string): boolean => {
  const row = SQLite.one<{ id: string }>`
    SELECT tca.id
    FROM teacher_class_assignments tca
    INNER JOIN teachers t ON t.id = tca.teacher_id
    INNER JOIN classes c ON c.id = tca.class_id
    WHERE t.user_id = ${teacherUserId}
      AND tca.class_id = ${classId}
      AND tca.academic_year_id = c.academic_year_id
  `;
  return !!row;
};
export const isTeacherHomeroomOfClass = (teacherUserId: string, classId: string): boolean => {
  const row = SQLite.one<{ id: string }>`
    SELECT tca.id
    FROM teacher_class_assignments tca
    INNER JOIN teachers t ON t.id = tca.teacher_id
    INNER JOIN classes c ON c.id = tca.class_id AND c.academic_year_id = tca.academic_year_id
    WHERE t.user_id = ${teacherUserId}
      AND tca.class_id = ${classId}
      AND tca.is_homeroom = 1
  `;
  return !!row;
};

export const isTeacherAssignedToClassSubject = (teacherUserId: string, classId: string, subjectId: string): boolean => {
  const row = SQLite.one<{ id: string }>`
    SELECT sch.id
    FROM schedules sch
    INNER JOIN classes scheduled_class
      ON scheduled_class.id = sch.class_id AND scheduled_class.academic_year_id = sch.academic_year_id
    WHERE sch.teacher_user_id = ${teacherUserId}
      AND sch.class_id = ${classId}
      AND sch.subject_id = ${subjectId}
    UNION ALL
    SELECT cs.id
    FROM class_subjects cs
    INNER JOIN teachers t ON t.id = cs.teacher_id
    INNER JOIN classes assigned_class
      ON assigned_class.id = cs.class_id AND assigned_class.academic_year_id = cs.academic_year_id
    WHERE t.user_id = ${teacherUserId}
      AND cs.class_id = ${classId}
      AND cs.subject_id = ${subjectId}
    LIMIT 1
  `;
  return !!row;
};


export const isTeacherAssignedToStudent = (teacherUserId: string, studentId: string): boolean => {
  const row = SQLite.one<{ id: string }>`
    SELECT tca.id
    FROM teacher_class_assignments tca
    INNER JOIN teachers t ON t.id = tca.teacher_id
    INNER JOIN students st ON st.class_id = tca.class_id
    INNER JOIN classes c ON c.id = st.class_id AND c.academic_year_id = tca.academic_year_id
    WHERE t.user_id = ${teacherUserId} AND st.id = ${studentId}
  `;
  return !!row;
};

export const syncTeacherClassAssignments = (
  teacherId: string,
  academicYearId: string,
  assignments: { class_id: string; is_homeroom: boolean }[],
): void => {
  const uniqueAssignments = [...new Map(assignments.map(assignment => [assignment.class_id, assignment])).values()];
  const homeroomCount = uniqueAssignments.filter(assignment => assignment.is_homeroom).length;
  if (homeroomCount > 1) throw new Error('A teacher can have only one homeroom class per academic year');

  const classIds = uniqueAssignments.map(assignment => assignment.class_id);
  if (classIds.length > 0) {
    const placeholders = classIds.map(() => '?').join(',');
    const validClasses = SQLite.all<{ id: string }>(
      `SELECT id FROM classes WHERE academic_year_id = ? AND id IN (${placeholders})`,
      [academicYearId, ...classIds],
    );
    if (validClasses.length !== classIds.length) {
      throw new Error('Every assigned class must belong to the selected academic year');
    }
  }

  SQLite.transaction(() => {
    SQLite.exec`
      DELETE FROM teacher_class_assignments
      WHERE teacher_id = ${teacherId} AND academic_year_id = ${academicYearId}
    `;

    const now = Date.now();
    for (const assignment of uniqueAssignments) {
      if (assignment.is_homeroom) {
        SQLite.exec`
          UPDATE teacher_class_assignments
          SET is_homeroom = 0
          WHERE class_id = ${assignment.class_id}
            AND academic_year_id = ${academicYearId}
        `;
      }
      SQLite.exec`
        INSERT INTO teacher_class_assignments (id, teacher_id, class_id, academic_year_id, is_homeroom, created_at)
        VALUES (
          ${randomUUID()},
          ${teacherId},
          ${assignment.class_id},
          ${academicYearId},
          ${assignment.is_homeroom ? 1 : 0},
          ${now}
        )
      `;
    }
  });
};
