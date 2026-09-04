import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRequest, mockResponse, mockUser } from '../helpers/mocks';

vi.mock('@queries/teacherConfirmations', () => ({
  findTeacherConfirmationById: vi.fn(),
  findAllTeacherConfirmations: vi.fn(() => []),
  findAllTeacherConfirmationLogs: vi.fn(() => []),
  findConfirmationsByTeacher: vi.fn(() => []),
  createTeacherConfirmation: vi.fn(),
  findTodayConfirmationByTeacher: vi.fn(),
}));
vi.mock('@queries/schedules', () => ({ findScheduleById: vi.fn() }));
vi.mock('@queries/schoolLocations', () => ({ findActiveSchoolLocation: vi.fn(() => null) }));
vi.mock('@services/Geolocation', () => ({
  haversineDistance: vi.fn(),
  validateCoordinates: vi.fn(() => true),
}));
vi.mock('@services/QrCode', () => ({
  verifyQrToken: vi.fn(() => ({ valid: true, expired: false, date: '2026-08-30' })),
}));
vi.mock('@queries/users', () => ({
  isAdmin: vi.fn(() => false),
  hasPermission: vi.fn(() => true),
}));
vi.mock('@queries/teacherClassAssignments', () => ({ isTeacherUser: vi.fn(() => true) }));
vi.mock('@services/Logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { submitTeacherConfirmation } from '../../app/handlers/teacherConfirmations';
import { createTeacherConfirmation, findTodayConfirmationByTeacher } from '@queries/teacherConfirmations';
import { findActiveSchoolLocation } from '@queries/schoolLocations';
import { haversineDistance } from '@services/Geolocation';
import { verifyQrToken } from '@services/QrCode';

const teacher = mockUser({ id: 'teacher-1', roles: ['teacher'] });
const validBody = { qr_token: 'signed-qr-token' };

const createdConfirmation = {
  id: 'confirmation-1',
  schedule_id: null,
  teacher_user_id: 'teacher-1',
  photo_url: null,
  latitude: null,
  longitude: null,
  distance_meters: null,
  is_inside_school: 0,
  confirmation_date: Date.now(),
  confirmed_at: Date.now(),
};

describe('teacher QR confirmation workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(findTodayConfirmationByTeacher).mockReturnValue(undefined);
    vi.mocked(verifyQrToken).mockReturnValue({ valid: true, expired: false, date: '2026-08-30' });
    vi.mocked(createTeacherConfirmation).mockReturnValue(createdConfirmation as never);
  });

  it('rejects a submission without a scanned QR token', async () => {
    const res = mockResponse();

    await submitTeacherConfirmation(mockRequest({ body: {}, user: teacher }), res);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ code: 'QR_TOKEN_REQUIRED' });
    expect(createTeacherConfirmation).not.toHaveBeenCalled();
  });

  it('rejects a second confirmation for any schedule on the same day', async () => {
    vi.mocked(findTodayConfirmationByTeacher).mockReturnValue(createdConfirmation as never);
    const res = mockResponse();

    await submitTeacherConfirmation(mockRequest({ body: validBody, user: teacher }), res);

    expect(res._status).toBe(409);
    expect(res._body).toMatchObject({ code: 'DUPLICATE_CONFIRMATION' });
    expect(createTeacherConfirmation).not.toHaveBeenCalled();
  });

  it('creates one daily confirmation without requiring a schedule id', async () => {
    const res = mockResponse();

    await submitTeacherConfirmation(mockRequest({ body: validBody, user: teacher }), res);

    expect(res._status).toBe(201);
    expect(createTeacherConfirmation).toHaveBeenCalledWith(expect.objectContaining({
      schedule_id: null,
      teacher_user_id: 'teacher-1',
    }));
  });

  it('rejects invalid or expired QR tokens', async () => {
    vi.mocked(verifyQrToken).mockReturnValue({ valid: false, expired: false });
    const invalidResponse = mockResponse();
    await submitTeacherConfirmation(mockRequest({ body: validBody, user: teacher }), invalidResponse);
    expect(invalidResponse._status).toBe(403);
    expect(invalidResponse._body).toMatchObject({ code: 'INVALID_QR_TOKEN' });

    vi.mocked(verifyQrToken).mockReturnValue({ valid: true, expired: true, date: '2026-08-30' });
    const expiredResponse = mockResponse();
    await submitTeacherConfirmation(mockRequest({ body: validBody, user: teacher }), expiredResponse);
    expect(expiredResponse._status).toBe(403);
    expect(expiredResponse._body).toMatchObject({ code: 'EXPIRED_QR_TOKEN' });
  });
  it('requires location when the school geofence is configured', async () => {
    vi.mocked(findActiveSchoolLocation).mockReturnValue({ latitude: -6.2, longitude: 106.8, radius_meters: 100 } as never);
    const res = mockResponse();

    await submitTeacherConfirmation(mockRequest({ body: validBody, user: teacher }), res);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ code: 'LOCATION_REQUIRED' });
    expect(createTeacherConfirmation).not.toHaveBeenCalled();
  });

  it('rejects confirmations outside the school radius', async () => {
    vi.mocked(findActiveSchoolLocation).mockReturnValue({ latitude: -6.2, longitude: 106.8, radius_meters: 100 } as never);
    vi.mocked(haversineDistance).mockReturnValue(500);
    const res = mockResponse();

    await submitTeacherConfirmation(mockRequest({ body: { ...validBody, latitude: -6.3, longitude: 106.9 }, user: teacher }), res);

    expect(res._status).toBe(403);
    expect(res._body).toMatchObject({ code: 'OUTSIDE_SCHOOL' });
    expect(createTeacherConfirmation).not.toHaveBeenCalled();
  });

  it('accepts confirmations inside the school radius without any photo', async () => {
    vi.mocked(findActiveSchoolLocation).mockReturnValue({ latitude: -6.2, longitude: 106.8, radius_meters: 100 } as never);
    vi.mocked(haversineDistance).mockReturnValue(15);
    const res = mockResponse();

    await submitTeacherConfirmation(mockRequest({ body: { ...validBody, latitude: -6.2001, longitude: 106.8001 }, user: teacher }), res);

    expect(res._status).toBe(201);
    expect(createTeacherConfirmation).toHaveBeenCalledWith(expect.objectContaining({
      photo_url: null,
      distance_meters: 15,
      is_inside_school: 1,
    }));
  });
});
