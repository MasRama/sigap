import { describe, it, expect } from 'vitest';
import { generateQrCodeData, verifyQrToken } from '../../app/services/QrCode';

describe('QR code service', () => {
  it('generates a signed token accepted for the current day', async () => {
    const data = await generateQrCodeData(5);
    const status = verifyQrToken(data.payload);

    expect(status.valid).toBe(true);
    expect(status.expired).toBe(false);
    expect(data.dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('rejects a token signed for another date', async () => {
    const data = await generateQrCodeData(5);
    const payload = JSON.parse(data.payload) as { date: string };
    payload.date = '2000-01-01';

    expect(verifyQrToken(JSON.stringify(payload)).valid).toBe(false);
  });
});
