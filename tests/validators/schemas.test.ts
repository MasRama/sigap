import { describe, it, expect } from 'vitest';
import {
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
  CreateUserSchema,
  UpdateUserSchema,
  DeleteUsersSchema,
  ChangeProfileSchema,
} from '../../app/validators/schemas';

describe('LoginSchema', () => {
  it('accepts valid username + password', () => {
    const result = LoginSchema.safeParse({ username: 'user_01', password: 'secret123' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe('user_01');
    }
  });

  it('lowercases uppercase username', () => {
    const result = LoginSchema.safeParse({ username: 'USER_01', password: 'secret123' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.username).toBe('user_01');
  });

  it('fails when username is missing', () => {
    const result = LoginSchema.safeParse({ password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('fails when password is empty', () => {
    const result = LoginSchema.safeParse({ username: 'user_01', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  const valid = { name: 'John Doe', username: 'john_doe', password: 'password123' };

  it('accepts valid registration data', () => {
    const result = RegisterSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.username).toBe('john_doe');
    }
  });

  it('fails when name is too short', () => {
    const result = RegisterSchema.safeParse({ ...valid, name: 'J' });
    expect(result.success).toBe(false);
  });

  it('fails with invalid username', () => {
    const result = RegisterSchema.safeParse({ ...valid, username: 'not valid' });
    expect(result.success).toBe(false);
  });

  it('fails when password is shorter than 8 chars', () => {
    const result = RegisterSchema.safeParse({ ...valid, password: '123' });
    expect(result.success).toBe(false);
  });
});

describe('ChangePasswordSchema', () => {
  it('accepts valid password change', () => {
    const result = ChangePasswordSchema.safeParse({ current_password: 'oldpass', new_password: 'newpass123' });
    expect(result.success).toBe(true);
  });

  it('fails when current_password is empty', () => {
    const result = ChangePasswordSchema.safeParse({ current_password: '', new_password: 'newpass123' });
    expect(result.success).toBe(false);
  });

  it('fails when new_password is too short', () => {
    const result = ChangePasswordSchema.safeParse({ current_password: 'old', new_password: 'short' });
    expect(result.success).toBe(false);
  });
});

describe('CreateUserSchema', () => {
  const valid = { name: 'Alice', username: 'alice', password: 'password123' };

  it('accepts valid user data', () => {
    const result = CreateUserSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts roles array', () => {
    const result = CreateUserSchema.safeParse({ ...valid, roles: ['admin', 'editor'] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.roles).toEqual(['admin', 'editor']);
  });
});

describe('UpdateUserSchema', () => {
  it('accepts partial update', () => {
    const result = UpdateUserSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('New Name');
  });

  it('fails when no fields provided', () => {
    const result = UpdateUserSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('DeleteUsersSchema', () => {
  it('accepts valid UUID array', () => {
    const ids = ['550e8400-e29b-41d4-a716-446655440000'];
    const result = DeleteUsersSchema.safeParse({ ids });
    expect(result.success).toBe(true);
  });

  it('fails with empty array', () => {
    const result = DeleteUsersSchema.safeParse({ ids: [] });
    expect(result.success).toBe(false);
  });

  it('fails with invalid UUIDs', () => {
    const result = DeleteUsersSchema.safeParse({ ids: ['not-a-uuid'] });
    expect(result.success).toBe(false);
  });
});

describe('ChangeProfileSchema', () => {
  it('accepts valid profile data', () => {
    const result = ChangeProfileSchema.safeParse({ name: 'Bob', username: 'bob_user' });
    expect(result.success).toBe(true);
  });

  it('lowercases username', () => {
    const result = ChangeProfileSchema.safeParse({ name: 'Bob', username: 'BOB_USER' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.username).toBe('bob_user');
  });
});
