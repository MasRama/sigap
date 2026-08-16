/**
 * Shared types — frontend-safe (no password/sensitive fields).
 *
 * Backend queries/handlers use `@types` (maps to models.ts — has password etc).
 * Frontend uses shared.ts via resources/types/forms.ts re-export.
 * Import: `import type { User, Role } from '../types'` in frontend pages.
 */

export interface User {
  id: string;
  name: string | null;
  email: string;
  avatar?: string | null;
  roles: string[];
  permissions: string[];
  created_at?: number;
  updated_at?: number;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permissions?: string[];
  user_count?: number;
  created_at?: number;
  updated_at?: number;
}

export interface RoleInfo {
  name: string;
  slug: string;
  description: string | null;
}

export interface Permission {
  id: string;
  name: string;
  slug: string;
  resource: string;
  action: string;
  description: string | null;
}

export type GroupedPermissions = Record<string, Permission[]>;

export interface Session {
  id: string;
  user_id: string;
  user_agent: string | null;
  expires_at: number | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface AcademicYear {
  id: string;
  name: string;
  start_at: number;
  end_at: number;
  is_active: number;
  is_grades_published: number;
  created_at?: number;
  updated_at?: number;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  academic_year_id: string;
  created_at?: number;
  updated_at?: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  kkm: number;
  created_at?: number;
  updated_at?: number;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  class_id: string;
  parent_user_id: string | null;
  phone: string | null;
  address: string | null;
  created_at?: number;
  updated_at?: number;
}

export interface Teacher {
  id: string;
  user_id: string;
  employee_id: string | null;
  phone: string | null;
  created_at?: number;
  updated_at?: number;
}

export interface Parent {
  id: string;
  user_id: string;
  phone: string | null;
  address: string | null;
  created_at?: number;
  updated_at?: number;
}

export interface Schedule {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_user_id: string;
  day_of_week: number;
  start_time: number;
  end_time: number;
  academic_year_id: string;
  created_at?: number;
  updated_at?: number;
}

export interface SchoolLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: number;
  created_at?: number;
}

export interface TeacherConfirmation {
  id: string;
  schedule_id: string;
  teacher_user_id: string;
  photo_url: string;
  latitude: number | null;
  longitude: number | null;
  distance_meters: number | null;
  is_inside_school: number;
  confirmed_at: number;
  created_at?: number;
}

export interface Journal {
  id: string;
  schedule_id: string;
  teacher_confirmation_id: string;
  date: number;
  material: string;
  created_at?: number;
  updated_at?: number;
}

export interface StudentAttendance {
  id: string;
  student_id: string;
  schedule_id: string;
  journal_id: string;
  status: 'present' | 'sick' | 'leave' | 'absent';
  created_at?: number;
  updated_at?: number;
}

export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  type: 'task' | 'daily_quiz' | 'midterm' | 'final';
  score: number;
  date: number;
  teacher_user_id: string;
  created_at?: number;
  updated_at?: number;
}

export interface GradeComponent {
  id: string;
  academic_year_id: string;
  type: string;
  name: string;
  weight: number;
  created_at?: number;
  updated_at?: number;
}

export interface GradeSummaryRow {
  student_id: string;
  student_name: string;
  nis: string;
  scores: Record<string, number | null>;
  final_score: number | null;
  kkm: number;
  predikat: string | null;
  is_passed: boolean | null;
}

export interface SubjectGradeSummary {
  subject_id: string;
  subject_name: string;
  kkm: number;
  scores: Record<string, number | null>;
  final_score: number | null;
  predikat: string | null;
  is_passed: boolean | null;
}

export interface GradeSummaryComponent {
  type: string;
  name: string;
  weight: number;
}

export interface ClassSubjectSummary {
  className: string;
  subjectName: string;
  kkm: number;
  components: GradeSummaryComponent[];
  rows: GradeSummaryRow[];
}

export interface GradeAuditLogRow {
  id: string;
  action: 'create' | 'update' | 'delete';
  student_name: string;
  subject_name: string;
  class_name: string;
  type: string;
  old_score: number | null;
  new_score: number | null;
  user_name: string;
  created_at: number;
}

export interface SessionStatusView {
  schedule_id: string;
  class_name: string;
  subject_name: string;
  teacher_name: string;
  start_time: number;
  end_time: number;
  confirmed: boolean;
  has_journal: boolean;
}

export interface JournalCompletenessView {
  teacher_name: string;
  expected: number;
  filled: number;
}

export interface GradeProgressView {
  class_name: string;
  subject_name: string;
  teacher_name: string;
  total_students: number;
  graded_students: number;
}

export interface OutsideConfirmationView {
  schedule_id: string;
  class_name: string;
  subject_name: string;
  teacher_name: string;
  distance_meters: number;
  confirmed_at: number;
}
