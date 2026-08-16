import type { ZodError } from 'zod';

export function zodToErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!errors[path]) errors[path] = [];
    errors[path].push(issue.message);
  }

  return errors;
}

export {
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
  CreateUserSchema,
  UpdateUserSchema,
  DeleteUsersSchema,
  ChangeProfileSchema,
  CreateRoleSchema,
  UpdateRoleSchema,
  AcademicYearSchema,
  UpdateAcademicYearSchema,
  ClassSchema,
  UpdateClassSchema,
  SubjectSchema,
  UpdateSubjectSchema,
  StudentSchema,
  UpdateStudentSchema,
  TeacherSchema,
  UpdateTeacherSchema,
  ParentSchema,
  UpdateParentSchema,
  ScheduleSchema,
  UpdateScheduleSchema,
  SchoolLocationSchema,
  UpdateSchoolLocationSchema,
  TeacherConfirmationSchema,
  JournalSchema,
  UpdateJournalSchema,
  StudentAttendanceSchema,
  GradeSchema,
  GradeComponentsSchema,
} from './schemas';

export type {
  LoginInput,
  RegisterInput,
  ChangePasswordInput,
  CreateUserInput,
  UpdateUserInput,
  DeleteUsersInput,
  ChangeProfileInput,
  CreateRoleInput,
  UpdateRoleInput,
  AcademicYearInput,
  UpdateAcademicYearInput,
  ClassInput,
  UpdateClassInput,
  SubjectInput,
  UpdateSubjectInput,
  StudentInput,
  UpdateStudentInput,
  TeacherInput,
  UpdateTeacherInput,
  ParentInput,
  UpdateParentInput,
  ScheduleInput,
  UpdateScheduleInput,
  SchoolLocationInput,
  UpdateSchoolLocationInput,
  TeacherConfirmationInput,
  JournalInput,
  UpdateJournalInput,
  StudentAttendanceInput,
  GradeInput,
  GradeComponentsInput,
} from './schemas';
