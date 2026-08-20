import type { NaraRequest, NaraResponse } from '@core';
import { jsonSuccess, jsonError, jsonValidationError } from '@core';
import Logger from '@services/Logger';
import { generateQrCodeData } from '@services/QrCode';
import { findSettingNumber, upsertSetting } from '@queries/appSettings';
import { findActiveSchoolLocation } from '@queries/schoolLocations';
import { isAdmin } from '@queries/users';
import { QrSettingsSchema, zodToErrors } from '@validators';
import { QR_REFRESH_INTERVAL_DEFAULT } from '@config/constants';

const canManage = (userId: string): boolean => isAdmin(userId);

export const qrSettingsPage = (req: NaraRequest, res: NaraResponse) => {
  const userId = req.user?.id;
  const allowed = userId ? canManage(userId) : false;
  const interval = findSettingNumber('qr_refresh_interval', QR_REFRESH_INTERVAL_DEFAULT);
  const school = findActiveSchoolLocation();

  return res.inertia('qrSettings', {
    permissions: { canEdit: allowed },
    qrRefreshInterval: interval,
    schoolName: school?.name ?? null,
  });
};

export const saveQrSettings = (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Sesi login diperlukan', 401);
  if (!canManage(req.user.id)) return jsonError(res, 'Kamu tidak memiliki akses untuk mengatur QR absen', 403);

  const parsed = QrSettingsSchema.safeParse(req.body);
  if (!parsed.success) return jsonValidationError(res, 'Pengaturan tidak valid', zodToErrors(parsed.error));

  try {
    upsertSetting('qr_refresh_interval', String(parsed.data.qr_refresh_interval));
    return jsonSuccess(res, 'Pengaturan QR absen disimpan');
  } catch (error: unknown) {
    Logger.error('Failed to save QR settings', error as Error);
    return jsonError(res, 'Gagal menyimpan pengaturan QR absen', 500);
  }
};

export const qrDisplayPage = (req: NaraRequest, res: NaraResponse) => {
  const interval = findSettingNumber('qr_refresh_interval', QR_REFRESH_INTERVAL_DEFAULT);
  const school = findActiveSchoolLocation();
  return res.inertia('qrDisplay', {
    qrRefreshInterval: interval,
    schoolName: school?.name ?? 'Sekolah',
  });
};

export const qrCodeData = async (req: NaraRequest, res: NaraResponse) => {
  if (!req.user) return jsonError(res, 'Sesi login diperlukan', 401);
  const interval = findSettingNumber('qr_refresh_interval', QR_REFRESH_INTERVAL_DEFAULT);
  try {
    const data = await generateQrCodeData(interval);
    return jsonSuccess(res, 'OK', data);
  } catch (error: unknown) {
    Logger.error('Failed to generate QR code', error as Error);
    return jsonError(res, 'Gagal membuat QR code', 500);
  }
};
