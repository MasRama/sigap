import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonCreated, jsonError, jsonServerError, jsonValidationError } from '@core';
import Logger from '@services/Logger';
import { findAllSchoolLocations, findSchoolLocationById, findActiveSchoolLocation, createSchoolLocation, updateSchoolLocation, deleteSchoolLocation, setActiveSchoolLocation } from '@queries/schoolLocations';
import { isAdmin, hasPermission } from '@queries/users';
import { SchoolLocationSchema, UpdateSchoolLocationSchema, zodToErrors } from '@validators';

const canView = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'school_locations.view');
const canManage = (userId: string): boolean => isAdmin(userId) || hasPermission(userId, 'school_locations.create');

export const schoolLocationsPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  const permissions = {
    canView: userId ? canView(userId) : false,
    canCreate: userId ? canManage(userId) : false,
    canEdit: userId ? isAdmin(userId) || hasPermission(userId, 'school_locations.edit') : false,
    canDelete: userId ? isAdmin(userId) || hasPermission(userId, 'school_locations.delete') : false,
  };
  return res.inertia('schoolLocations', { permissions });
};

export const listSchoolLocations = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  return jsonSuccess(res, 'OK', findAllSchoolLocations());
};

export const activeSchoolLocationData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  const location = findActiveSchoolLocation();
  if (!location) return jsonError(res, 'No active school location set', 404);
  return jsonSuccess(res, 'OK', location);
};

export const schoolLocationData = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canView(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const item = findSchoolLocationById(req.params.id || '');
  if (!item) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'OK', item);
};

export const addSchoolLocation = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!canManage(req.user.id)) return jsonError(res, 'Forbidden', 403);

  const parsed = SchoolLocationSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = createSchoolLocation({
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      radius_meters: parsed.data.radius_meters ?? null,
      is_active: parsed.data.is_active ?? 0,
    });
    return jsonCreated(res, 'School location created', item);
  } catch (error: unknown) {
    Logger.error('Failed to create school location', error as Error);
    return jsonServerError(res, 'Failed to create school location');
  }
};

export const editSchoolLocation = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'school_locations.edit')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const parsed = UpdateSchoolLocationSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Validation failed', zodToErrors(parsed.error));

  try {
    const item = updateSchoolLocation(id, parsed.data);
    if (!item) return jsonError(res, 'Not found', 404);
    return jsonSuccess(res, 'School location updated', item);
  } catch (error: unknown) {
    Logger.error('Failed to update school location', error as Error);
    return jsonServerError(res, 'Failed to update school location');
  }
};

export const removeSchoolLocation = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'school_locations.delete')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  const ok = deleteSchoolLocation(id);
  if (!ok) return jsonError(res, 'Not found', 404);
  return jsonSuccess(res, 'School location deleted');
};

export const activateSchoolLocation = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Unauthorized', 401);
  if (!isAdmin(req.user.id) && !hasPermission(req.user.id, 'school_locations.edit')) return jsonError(res, 'Forbidden', 403);

  const id = req.params.id;
  if (!id) return jsonError(res, 'ID required', 400);

  if (!findSchoolLocationById(id)) return jsonError(res, 'Not found', 404);
  setActiveSchoolLocation(id);
  return jsonSuccess(res, 'School location activated');
};
