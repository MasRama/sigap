import { describe, it, expect } from 'vitest';
import { extractQrTokenFromScan } from '$lib/qr';

const TOKEN = '{"date":"2026-09-04","nonce":"abc123","expires_at":1780000000000,"token":"deadbeef"}';

describe('extractQrTokenFromScan()', () => {
  it('extracts qr_token from a scanned school QR url', () => {
    const url = `https://sekolah.example/teacher/confirm?qr_token=${encodeURIComponent(TOKEN)}`;
    expect(extractQrTokenFromScan(url)).toBe(TOKEN);
  });

  it('ignores extra query params around qr_token', () => {
    const url = `http://localhost:5555/teacher/confirm?foo=1&qr_token=${encodeURIComponent(TOKEN)}&bar=2`;
    expect(extractQrTokenFromScan(url)).toBe(TOKEN);
  });

  it('accepts a raw JSON payload scan', () => {
    expect(extractQrTokenFromScan(TOKEN)).toBe(TOKEN);
  });

  it('trims surrounding whitespace', () => {
    expect(extractQrTokenFromScan(`  ${TOKEN}\n`)).toBe(TOKEN);
  });

  it('returns null for a url without qr_token', () => {
    expect(extractQrTokenFromScan('https://sekolah.example/teacher/confirm')).toBeNull();
  });

  it('returns null for unrecognized text', () => {
    expect(extractQrTokenFromScan('halo dunia')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(extractQrTokenFromScan('   ')).toBeNull();
  });
});
