import { describe, it, expect, beforeEach } from 'vitest';
import LoginThrottle from '../../app/services/LoginThrottle';

describe('LoginThrottle', () => {
  const username = 'testuser';
  const ip = '127.0.0.1';

  beforeEach(() => {
    LoginThrottle.clearAttempts(username, ip);
    LoginThrottle.configure({ maxAttempts: 3, lockoutMs: 1000, windowMs: 1000 });
  });

  it('should not be locked out initially', () => {
    expect(LoginThrottle.isLockedOut(username, ip)).toBe(false);
  });

  it('should lock out after max attempts', () => {
    LoginThrottle.recordFailedAttempt(username, ip);
    LoginThrottle.recordFailedAttempt(username, ip);
    LoginThrottle.recordFailedAttempt(username, ip);
    
    expect(LoginThrottle.isLockedOut(username, ip)).toBe(true);
  });

  it('should track attempt counts', () => {
    LoginThrottle.recordFailedAttempt(username, ip);
    LoginThrottle.recordFailedAttempt(username, ip);
    
    const counts = LoginThrottle.getAttemptCounts(username, ip);
    expect(counts.identifierAttempts).toBe(2);
    expect(counts.ipAttempts).toBe(2);
  });

  it('should clear attempts', () => {
    LoginThrottle.recordFailedAttempt(username, ip);
    LoginThrottle.recordFailedAttempt(username, ip);
    LoginThrottle.recordFailedAttempt(username, ip);
    
    LoginThrottle.clearAttempts(username, ip);
    
    expect(LoginThrottle.isLockedOut(username, ip)).toBe(false);
    expect(LoginThrottle.getAttemptCounts(username, ip).identifierAttempts).toBe(0);
  });

  it('should return remaining lockout time when locked', () => {
    LoginThrottle.recordFailedAttempt(username, ip);
    LoginThrottle.recordFailedAttempt(username, ip);
    LoginThrottle.recordFailedAttempt(username, ip);
    
    const remaining = LoginThrottle.getRemainingLockoutTime(username, ip);
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(1000);
  });

  it('should return 0 lockout time when not locked', () => {
    expect(LoginThrottle.getRemainingLockoutTime(username, ip)).toBe(0);
  });

  it('should return lockout info from recordFailedAttempt', () => {
    const result = LoginThrottle.recordFailedAttempt(username, ip);
    expect(result.isLocked).toBe(false);
    expect(result.remainingAttempts).toBe(2);
  });

  it('should return isLocked true on third attempt', () => {
    LoginThrottle.recordFailedAttempt(username, ip);
    LoginThrottle.recordFailedAttempt(username, ip);
    const result = LoginThrottle.recordFailedAttempt(username, ip);
    
    expect(result.isLocked).toBe(true);
    expect(result.remainingAttempts).toBe(0);
    expect(result.lockoutMs).toBeGreaterThan(0);
  });

  it('should track separate IPs independently', () => {
    LoginThrottle.recordFailedAttempt(username, '1.1.1.1');
    LoginThrottle.recordFailedAttempt(username, '1.1.1.1');
    LoginThrottle.recordFailedAttempt(username, '1.1.1.1');
    
    expect(LoginThrottle.isLockedOut(username, '1.1.1.1')).toBe(true);
    expect(LoginThrottle.isLockedOut('other-user', '2.2.2.2')).toBe(false);
  });
});
