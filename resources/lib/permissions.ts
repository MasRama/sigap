import { page as inertiaPage } from '@inertiajs/svelte';
import { derived, type Readable } from 'svelte/store';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';
export type PermissionResource =
  | 'users'
  | 'roles'
  | 'settings'
  | 'academic_years'
  | 'classes'
  | 'subjects'
  | 'students'
  | 'teachers'
  | 'parents'
  | 'schedules'
  | 'school_locations'
  | 'confirmations'
  | 'journals'
  | 'grades'
  | 'attendance'
  | 'headmaster';

export function permissionSlug(resource: PermissionResource, action: PermissionAction): string {
  return `${resource}.${action}`;
}

export function hasPermission(permissions: string[], resource: PermissionResource, action: PermissionAction): boolean {
  return permissions.includes(permissionSlug(resource, action));
}

export const currentUserPermissions: Readable<string[]> = derived(inertiaPage, ($page) => {
  const user = $page.props.user as { permissions?: string[] } | undefined;
  return user?.permissions || [];
});

export function can(permissions: string[], resource: PermissionResource, action: PermissionAction): boolean {
  return hasPermission(permissions, resource, action);
}
