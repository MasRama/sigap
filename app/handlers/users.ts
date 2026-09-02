import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError, queryInt, queryString, isUniqueConstraintError } from '@core';
import { hashPassword } from '@services/Authenticate';
import Logger from '@services/Logger';
import {
  getUsersPaginated, createUser, updateUser, deleteUsers,
  getUserRoles, getRolesForUsers, isAdmin, syncRoles, findUserById
} from '@queries';
import { findAllRoles, findRoleBySlug, getUsersWithRole } from '@queries/roles';
import { createParent, findParentByUserId } from '@queries/parents';
import { findStudentsForParentSelect, findStudentById, findStudentsByParent, linkStudentToParent } from '@queries/students';
import { randomUUID } from 'crypto';
import { CreateUserSchema, UpdateUserSchema, DeleteUsersSchema, ChangeProfileSchema, zodToErrors } from '@validators';

export const dashboardPage = (req: NaraRequest, res: NaraResponse) => {
  const page = queryInt(req, 'page');
  const limit = queryInt(req, 'limit', 10);
  const search = queryString(req, 'search');

  const result = getUsersPaginated(page, limit, search);
  const admin = req.user ? isAdmin(req.user.id) : false;
  const rolesMap = getRolesForUsers(result.data.map(u => u.id));

  const users = result.data.map(u => ({
    id: u.id, name: u.name, username: admin ? u.username : undefined,
    avatar: u.avatar,
    roles: (rolesMap.get(u.id) || []).map(r => r.slug),
  }));

  return res.inertia('dashboard', {
    users, total: result.total, page, limit, search,
  });
};

export const usersPage = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return res.redirect('/login');

  const userId = req.user.id;
  const admin = isAdmin(userId);
  const canView = admin;
  if (!canView) {
    return res.inertia('users', {
      users: [], availableRoles: [], students: [],
      permissions: { canCreate: false, canEdit: false, canDelete: false },
      total: 0, page: 1, limit: 10, search: '',
    });
  }

  const page = queryInt(req, 'page');
  const limit = queryInt(req, 'limit', 10);
  const search = queryString(req, 'search');

  const result = getUsersPaginated(page, limit, search);
  const canCreate = admin;
  const canEdit = admin;
  const canDelete = admin;
  const rolesMap = getRolesForUsers(result.data.map(u => u.id));

  const users = result.data.map(u => ({
    id: u.id, name: u.name,
    username: u.username,
    avatar: u.avatar,
    roles: (rolesMap.get(u.id) || []).map(r => r.slug),
  }));

  const roles = findAllRoles().map(r => ({ name: r.name, slug: r.slug, description: r.description }));
  const students = findStudentsForParentSelect().map(s => ({ id: s.id, nis: s.nis, name: s.name, class_name: s.class_name }));

  return res.inertia('users', {
    users, availableRoles: roles, students,
    permissions: { canCreate, canEdit, canDelete },
    total: result.total, page, limit, search,
  });
};

export const profilePage = (req: NaraRequest, res: NaraResponse) => {
  return res.inertia('profile');
};

export const changeProfile = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const parsed = ChangeProfileSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  const currentRoles = getUserRoles(req.user.id);
  if (currentRoles.some(role => role.slug === 'parent')) {
    const linkedChildren = findStudentsByParent(req.user.id);
    const usernameMatchesChild = linkedChildren.some(
      child => child.nis.toLowerCase() === parsed.data.username.toLowerCase(),
    );
    if (!usernameMatchesChild) {
      return jsonError(res, 'Username akun orang tua harus sama dengan NIS anak yang terhubung', 400, 'USERNAME_NIS_MISMATCH');
    }
  }

  const { name, username } = parsed.data;

  try {
    updateUser(req.user.id, { name, username });
    return jsonSuccess(res, 'Profil diperbarui');
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return jsonError(res, 'Username sudah digunakan', 400, 'DUPLICATE_USERNAME');
    }
    Logger.error('Failed to update profile', error as Error);
    return jsonServerError(res, 'Gagal memperbarui profil');
  }
};

export const addUser = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id)) {
    return jsonError(res, 'Forbidden', 403);
  }

  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  const { name, username, password, roles, student_id } = parsed.data;

  // Only admins can assign roles
  const canAssignRoles = isAdmin(req.user.id);

  if (roles?.includes('parent')) {
    if (!student_id) {
      return jsonError(res, 'Akun orang tua harus terhubung ke siswa', 400, 'PARENT_STUDENT_REQUIRED');
    }

    const student = findStudentById(student_id);
    if (!student) return jsonError(res, 'Siswa tidak ditemukan', 404, 'STUDENT_NOT_FOUND');
    if (student.nis.toLowerCase() !== username.toLowerCase()) {
      return jsonError(res, 'Username untuk akun orang tua harus sama dengan NIS siswa', 400, 'USERNAME_NIS_MISMATCH');
    }
    if (student.parent_user_id) {
      return jsonError(res, 'Siswa sudah terhubung ke akun orang tua lain', 400, 'STUDENT_ALREADY_LINKED');
    }
  }

  try {
    const user = createUser({
      id: randomUUID(),
      name, username,
      password: hashPassword(password),
    });

    if (roles?.length && canAssignRoles) {
      const allRoles = findAllRoles();
      const roleIds = roles.map(slug => allRoles.find(r => r.slug === slug)?.id).filter(Boolean) as string[];
      syncRoles(user.id, roleIds);
    }
    if (roles?.includes('parent') && !findParentByUserId(user.id)) {
      createParent({ user_id: user.id, phone: null, address: null });
    }

    if (student_id && roles?.includes('parent')) {
      linkStudentToParent(student_id, user.id);
    }

    const userRoles = getUserRoles(user.id);
    return jsonCreated(res, 'Pengguna dibuat', {
      user: { id: user.id, name: user.name, username: user.username, roles: userRoles.map(r => r.slug) }
    });
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return jsonError(res, 'Username sudah digunakan', 400, 'DUPLICATE_USERNAME');
    }
    Logger.error('Failed to create user', error as Error);
    return jsonServerError(res, 'Gagal membuat pengguna');
  }
};

export const editUser = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  // Users can update own profile, or need users.edit permission
  const isSelf = req.user.id === id;
  const admin = isAdmin(req.user.id);
  if (!isSelf && !admin) {
    return jsonError(res, 'Forbidden', 403);
  }

  const parsed = UpdateUserSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  const data = parsed.data;
  const { roles, password, student_id: studentId, ...rest } = data;
  if (studentId !== undefined && !admin) {
    return jsonError(res, 'Pengaitan siswa hanya dapat dilakukan admin', 403, 'PARENT_STUDENT_ADMIN_ONLY');
  }
  const currentRoles = getUserRoles(id).map(role => role.slug);
  const effectiveRoles = admin && roles !== undefined ? roles : currentRoles;

  if (effectiveRoles.includes('parent')) {
    const existingUser = findUserById(id);
    if (!existingUser) return jsonError(res, 'Pengguna tidak ditemukan', 404, 'USER_NOT_FOUND');

    const username = data.username ?? existingUser.username;
    const linkedChildren = findStudentsByParent(id);
    const selectedStudent = studentId ? findStudentById(studentId) : undefined;
    if (studentId && !selectedStudent) {
      return jsonError(res, 'Siswa tidak ditemukan', 404, 'STUDENT_NOT_FOUND');
    }

    const loginStudent = selectedStudent ?? linkedChildren.find(
      child => child.nis.toLowerCase() === username.toLowerCase(),
    );
    if (!loginStudent) {
      return jsonError(
        res,
        linkedChildren.length > 0
          ? 'Username akun orang tua harus sama dengan NIS siswa yang terhubung'
          : 'Akun orang tua harus terhubung ke siswa',
        400,
        linkedChildren.length > 0 ? 'USERNAME_NIS_MISMATCH' : 'PARENT_STUDENT_REQUIRED',
      );
    }
    if (loginStudent.nis.toLowerCase() !== username.toLowerCase()) {
      return jsonError(res, 'Username untuk akun orang tua harus sama dengan NIS siswa', 400, 'USERNAME_NIS_MISMATCH');
    }
    if (loginStudent.parent_user_id && loginStudent.parent_user_id !== id) {
      return jsonError(res, 'Siswa sudah terhubung ke akun orang tua lain', 400, 'STUDENT_ALREADY_LINKED');
    }
  }

  const updateData: Record<string, unknown> = { ...rest };

  if (password) updateData.password = hashPassword(password);

  try {
    const user = updateUser(id, updateData);
    if (!user) return jsonError(res, 'Pengguna tidak ditemukan', 404, 'USER_NOT_FOUND');
    if (roles !== undefined && admin) {
      const allRoles = findAllRoles();
      const roleIds = roles.map(slug => allRoles.find(r => r.slug === slug)?.id).filter(Boolean) as string[];

      // Prevent admin from removing own admin role (self-lockout)
      if (isSelf) {
        const adminRole = allRoles.find(r => r.slug === 'admin');
        if (adminRole && !roleIds.includes(adminRole.id)) {
          return jsonError(res, 'Cannot remove admin role from yourself', 400, 'SELF_DEMOTION');
        }
      }

      syncRoles(id, roleIds);
    }
    if (effectiveRoles.includes('parent') && !findParentByUserId(id)) {
      createParent({ user_id: id, phone: null, address: null });
    }
    if (studentId && effectiveRoles.includes('parent')) {
      linkStudentToParent(studentId, id);
    }
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return jsonError(res, 'Username sudah digunakan', 400, 'DUPLICATE_USERNAME');
    }
    Logger.error('Failed to update user', error as Error);
    return jsonServerError(res, 'Gagal memperbarui pengguna');
  }
};

export const removeUsers = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id)) {
    return jsonError(res, 'Forbidden', 403);
  }

  const parsed = DeleteUsersSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  const { ids } = parsed.data;

  // Prevent self-deletion
  if (ids.includes(req.user.id)) {
    return jsonError(res, 'Cannot delete your own account', 400, 'SELF_DELETE');
  }

  // Prevent deleting the last admin
  const adminRole = findRoleBySlug('admin');
  if (adminRole) {
    const adminUsers = getUsersWithRole(adminRole.id);
    const adminIds = adminUsers.map(u => u.id);
    const remainingAdmins = adminIds.filter(aid => !ids.includes(aid));
    if (remainingAdmins.length === 0) {
      return jsonError(res, 'Cannot delete the last admin', 400, 'LAST_ADMIN');
    }
  }

  const deleted = deleteUsers(ids);

  Logger.warn('Users deleted', { adminId: req.user.id, deletedIds: ids, count: deleted, ip: req.ip });
  return jsonSuccess(res, 'Users deleted', { deleted });
};
