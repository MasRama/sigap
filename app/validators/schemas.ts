import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email format').transform(v => v.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be at most 100 characters'),
});

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be at most 100 characters'),
});

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email format').transform(v => v.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  roles: z.array(z.string()).optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters').optional(),
  email: z.string().email('Invalid email format').transform(v => v.toLowerCase()).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  roles: z.array(z.string()).optional(),
}).refine(
  data => data.name !== undefined || data.email !== undefined ||
          data.password !== undefined || data.roles !== undefined,
  { message: 'At least one field is required to update', path: ['_root'] }
);

export const DeleteUsersSchema = z.object({
  ids: z.array(z.string().uuid('Invalid ID format')).min(1, 'At least one ID must be selected'),
});

export const ChangeProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Invalid email format').transform(v => v.toLowerCase()),
});

export const CreateRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').max(100, 'Role name must be at most 100 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(100, 'Slug must be at most 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
    .transform(v => v.toLowerCase()),
  description: z.string().max(500, 'Description must be at most 500 characters').optional().nullable().or(z.literal('')),
  permissions: z.array(z.string()).optional().default([]),
});

export const UpdateRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').max(100, 'Role name must be at most 100 characters').optional(),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(100, 'Slug must be at most 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
    .transform(v => v.toLowerCase()).optional(),
  description: z.string().max(500, 'Description must be at most 500 characters').optional().nullable().or(z.literal('')),
  permissions: z.array(z.string()).optional(),
}).refine(
  data => data.name !== undefined || data.slug !== undefined ||
          data.description !== undefined || data.permissions !== undefined,
  { message: 'At least one field is required to update', path: ['_root'] }
);

export const AcademicYearSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  start_at: z.number({ message: 'Start date is required' }),
  end_at: z.number({ message: 'End date is required' }),
  is_active: z.number().optional(),
  is_grades_published: z.number().optional(),
});

export const UpdateAcademicYearSchema = AcademicYearSchema.partial().refine(
  data => data.name !== undefined || data.start_at !== undefined || data.end_at !== undefined || data.is_active !== undefined || data.is_grades_published !== undefined,
  { message: 'At least one field is required to update', path: ['_root'] }
);

export const ClassSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  grade: z.string().min(1, 'Grade is required').max(50, 'Grade must be at most 50 characters'),
  academic_year_id: z.string().uuid('Invalid academic year ID'),
});

export const UpdateClassSchema = ClassSchema.partial().refine(
  data => data.name !== undefined || data.grade !== undefined || data.academic_year_id !== undefined,
  { message: 'At least one field is required to update', path: ['_root'] }
);

export const SubjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  code: z.string().min(1, 'Code is required').max(50, 'Code must be at most 50 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Code may only contain letters, numbers, and hyphens'),
  kkm: z.number({ message: 'KKM is required' }).min(0, 'KKM must be at least 0').max(100, 'KKM must be at most 100').default(75),
});

export const UpdateSubjectSchema = SubjectSchema.partial().refine(
  data => data.name !== undefined || data.code !== undefined || data.kkm !== undefined,
  { message: 'At least one field is required to update', path: ['_root'] }
);

export const StudentSchema = z.object({
  nis: z.string().min(1, 'NIS is required').max(50, 'NIS must be at most 50 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  class_id: z.string().uuid('Invalid class ID'),
  parent_user_id: z.string().uuid('Invalid parent ID').optional().nullable(),
  phone: z.string().max(20, 'Phone must be at most 20 characters').optional().nullable(),
  address: z.string().max(500, 'Address must be at most 500 characters').optional().nullable(),
});

export const UpdateStudentSchema = StudentSchema.partial().refine(
  data => Object.values(data).some(v => v !== undefined),
  { message: 'At least one field is required to update', path: ['_root'] }
);

export const TeacherSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  employee_id: z.string().max(50, 'Employee ID must be at most 50 characters').optional().nullable(),
  phone: z.string().max(20, 'Phone must be at most 20 characters').optional().nullable(),
});

export const UpdateTeacherSchema = TeacherSchema.partial().refine(
  data => data.user_id !== undefined || data.employee_id !== undefined || data.phone !== undefined,
  { message: 'At least one field is required to update', path: ['_root'] }
);

export const ParentSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  phone: z.string().max(20, 'Phone must be at most 20 characters').optional().nullable(),
  address: z.string().max(500, 'Address must be at most 500 characters').optional().nullable(),
});

export const UpdateParentSchema = ParentSchema.partial().refine(
  data => data.user_id !== undefined || data.phone !== undefined || data.address !== undefined,
  { message: 'At least one field is required to update', path: ['_root'] }
);

export const ScheduleSchema = z.object({
  class_id: z.string().uuid('Invalid class ID'),
  subject_id: z.string().uuid('Invalid subject ID'),
  teacher_user_id: z.string().uuid('Invalid teacher user ID'),
  day_of_week: z.number().int().min(0, 'Day must be 0-6').max(6, 'Day must be 0-6'),
  start_time: z.number({ message: 'Start time is required' }),
  end_time: z.number({ message: 'End time is required' }),
  academic_year_id: z.string().uuid('Invalid academic year ID'),
});

export const UpdateScheduleSchema = ScheduleSchema.partial().refine(
  data => Object.values(data).some(v => v !== undefined),
  { message: 'At least one field is required to update', path: ['_root'] }
);

export const SchoolLocationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  latitude: z.number({ message: 'Latitude is required' }),
  longitude: z.number({ message: 'Longitude is required' }),
  radius_meters: z.number().int().positive('Radius must be positive'),
  is_active: z.number().optional(),
});

export const UpdateSchoolLocationSchema = SchoolLocationSchema.partial().refine(
  data => Object.values(data).some(v => v !== undefined),
  { message: 'At least one field is required to update', path: ['_root'] }
);

export const TeacherConfirmationSchema = z.object({
  schedule_id: z.string().uuid('Invalid schedule ID'),
  teacher_user_id: z.string().uuid('Invalid teacher user ID'),
  photo_url: z.string().min(1, 'Photo is required'),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  distance_meters: z.number().optional().nullable(),
  is_inside_school: z.number().optional(),
  confirmed_at: z.number({ message: 'Confirmed at is required' }),
});

export const JournalSchema = z.object({
  schedule_id: z.string().uuid('Invalid schedule ID'),
  teacher_confirmation_id: z.string().uuid('Invalid teacher confirmation ID'),
  date: z.number({ message: 'Date is required' }),
  material: z.string().min(1, 'Material is required').max(2000, 'Material must be at most 2000 characters'),
});

export const UpdateJournalSchema = JournalSchema.partial().refine(
  data => data.schedule_id !== undefined || data.teacher_confirmation_id !== undefined || data.date !== undefined || data.material !== undefined,
  { message: 'At least one field is required to update', path: ['_root'] }
);

export const StudentAttendanceSchema = z.object({
  student_id: z.string().uuid('Invalid student ID'),
  schedule_id: z.string().uuid('Invalid schedule ID'),
  journal_id: z.string().uuid('Invalid journal ID'),
  status: z.enum(['present', 'sick', 'leave', 'absent']),
});

export const GradeSchema = z.object({
  student_id: z.string().uuid('Invalid student ID'),
  subject_id: z.string().uuid('Invalid subject ID'),
  class_id: z.string().uuid('Invalid class ID'),
  type: z.enum(['task', 'daily_quiz', 'midterm', 'final']),
  score: z.number().min(0, 'Score must be at least 0').max(100, 'Score must be at most 100'),
  date: z.number({ message: 'Date is required' }),
  teacher_user_id: z.string().uuid('Invalid teacher user ID').optional(),
});

export const GradeComponentsSchema = z.object({
  components: z.array(z.object({
    type: z.enum(['task', 'daily_quiz', 'midterm', 'final']),
    name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),
    weight: z.number().min(0, 'Weight must be at least 0').max(100, 'Weight must be at most 100'),
  })).min(1, 'At least one component is required'),
}).refine(
  data => Math.abs(data.components.reduce((sum, c) => sum + c.weight, 0) - 100) < 0.001,
  { message: 'Weights must sum to 100', path: ['components'] }
);

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type DeleteUsersInput = z.infer<typeof DeleteUsersSchema>;
export type ChangeProfileInput = z.infer<typeof ChangeProfileSchema>;
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
export type AcademicYearInput = z.infer<typeof AcademicYearSchema>;
export type UpdateAcademicYearInput = z.infer<typeof UpdateAcademicYearSchema>;
export type ClassInput = z.infer<typeof ClassSchema>;
export type UpdateClassInput = z.infer<typeof UpdateClassSchema>;
export type SubjectInput = z.infer<typeof SubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof UpdateSubjectSchema>;
export type StudentInput = z.infer<typeof StudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
export type TeacherInput = z.infer<typeof TeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof UpdateTeacherSchema>;
export type ParentInput = z.infer<typeof ParentSchema>;
export type UpdateParentInput = z.infer<typeof UpdateParentSchema>;
export type ScheduleInput = z.infer<typeof ScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof UpdateScheduleSchema>;
export type SchoolLocationInput = z.infer<typeof SchoolLocationSchema>;
export type UpdateSchoolLocationInput = z.infer<typeof UpdateSchoolLocationSchema>;
export type TeacherConfirmationInput = z.infer<typeof TeacherConfirmationSchema>;
export type JournalInput = z.infer<typeof JournalSchema>;
export type UpdateJournalInput = z.infer<typeof UpdateJournalSchema>;
export type StudentAttendanceInput = z.infer<typeof StudentAttendanceSchema>;
export type GradeInput = z.infer<typeof GradeSchema>;
export type GradeComponentsInput = z.infer<typeof GradeComponentsSchema>;
