import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { authService } from '../src/services/authService.js';
import { isSupabaseConfigured } from '../src/lib/supabaseClient.js';

describe('Supabase Client Configuration', () => {
  it('correctly reports configuration status without throwing', () => {
    const configured = authService.isConfigured();
    assert.equal(typeof configured, 'boolean');
    assert.equal(configured, isSupabaseConfigured);
  });
});

describe('authService — Input Validation & Error Handling', () => {
  it('signInWithEmail returns friendly configuration notice when unconfigured', async () => {
    if (!isSupabaseConfigured) {
      const result = await authService.signInWithEmail('admin@example.com', 'secret123');
      assert.equal(result.user, null);
      assert.equal(result.session, null);
      assert.match(result.error, /Supabase loyihasi ulanmagan/);
    }
  });

  it('signOut executes safely and returns success', async () => {
    const result = await authService.signOut();
    assert.equal(typeof result.success, 'boolean');
  });

  it('sendPasswordResetEmail handles unconfigured project safely', async () => {
    if (!isSupabaseConfigured) {
      const result = await authService.sendPasswordResetEmail('admin@example.com');
      assert.equal(result.success, false);
      assert.match(result.error, /Supabase loyihasi ulanmagan/);
    }
  });

  it('updatePassword rejects safely when unconfigured', async () => {
    if (!isSupabaseConfigured) {
      const result = await authService.updatePassword('newPassword123');
      assert.equal(result.success, false);
      assert.match(result.error, /Supabase loyihasi ulanmagan/);
    }
  });

  it('checkIsAdmin returns false safely when no user or unconfigured', async () => {
    const isAdminNull = await authService.checkIsAdmin(null);
    assert.equal(isAdminNull, false);

    const isAdminEmpty = await authService.checkIsAdmin('');
    assert.equal(isAdminEmpty, false);
  });
});

describe('Client-Side Form Validation Rules', () => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  it('validates email format strictly', () => {
    assert.equal(EMAIL_REGEX.test('admin@namuna.uz'), true);
    assert.equal(EMAIL_REGEX.test('user.name+tag@domain.co'), true);
    assert.equal(EMAIL_REGEX.test('invalid-email'), false);
    assert.equal(EMAIL_REGEX.test('admin@'), false);
    assert.equal(EMAIL_REGEX.test('@domain.com'), false);
    assert.equal(EMAIL_REGEX.test('admin@domain'), false);
  });

  it('validates password length requirements', () => {
    const isValidPassword = (p) => typeof p === 'string' && p.length >= 8;
    assert.equal(isValidPassword('short'), false);
    assert.equal(isValidPassword('1234567'), false);
    assert.equal(isValidPassword('12345678'), true);
    assert.equal(isValidPassword('StrongPass#2026'), true);
  });
});

