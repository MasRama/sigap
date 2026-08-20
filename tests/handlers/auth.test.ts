import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockRequest, mockResponse } from '../helpers/mocks';

vi.mock('@queries', () => ({
  findUserByUsername: vi.fn(),
  findUserById: vi.fn(),
  updatePassword: vi.fn(),
  deleteSessionsByUserId: vi.fn(),
}));

vi.mock('@services/Authenticate', () => ({
  hashPassword: vi.fn((password: string) => `hashed-${password}`),
  comparePassword: vi.fn(),
  processLogin: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('@services/LoginThrottle', () => ({
  default: {
    isLockedOut: vi.fn(() => false),
    getRemainingLockoutTime: vi.fn(() => 0),
    recordFailedAttempt: vi.fn(() => ({ isLocked: false, lockoutMs: 0 })),
    clearAttempts: vi.fn(),
  },
}));

vi.mock('@services/Logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), logSecurity: vi.fn(), logAuth: vi.fn() },
}));

import { submitLogin } from '../../app/handlers/auth';
import { findUserByUsername } from '@queries';
import { comparePassword, processLogin } from '@services/Authenticate';

const user = {
  id: 'user-1',
  name: 'Guru',
  username: 'guru',
  avatar: null,
  membership_date: null,
  password: 'hashed-password',
  remember_me_token: null,
  created_at: 0,
  updated_at: 0,
};

describe('auth handler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('authenticates with a normalized username', () => {
    vi.mocked(findUserByUsername).mockReturnValue(user);
    vi.mocked(comparePassword).mockReturnValue(true);

    const req = mockRequest({ body: { username: 'GURU', password: 'secret123' } });
    const res = mockResponse();
    submitLogin(req, res);

    expect(findUserByUsername).toHaveBeenCalledWith('guru');
    expect(processLogin).toHaveBeenCalledWith(user, req, res);
    expect(res._status).toBe(200);
    expect(res._body).toMatchObject({ success: true });
  });

  it('rejects invalid username credentials', () => {
    vi.mocked(findUserByUsername).mockReturnValue(undefined);
    vi.mocked(comparePassword).mockReturnValue(false);

    const req = mockRequest({ body: { username: 'unknown', password: 'secret123' } });
    const res = mockResponse();
    submitLogin(req, res);

    expect(processLogin).not.toHaveBeenCalled();
    expect(res._status).toBe(401);
    expect(res._body).toMatchObject({
      success: false,
      message: 'Username atau kata sandi salah',
      code: 'INVALID_CREDENTIALS',
    });
  });
});
