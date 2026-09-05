import QRCode from 'qrcode';
import { createHmac, randomBytes } from 'crypto';

interface QrTokenPayload {
  date: string;
  nonce: string;
  expires_at: number;
  token: string;
}

const QR_SECRET = process.env.QR_SECRET || 'sigap-qr-secret-change-in-production';
const APP_URL = (process.env.APP_URL || `http://localhost:${process.env.PORT || '5555'}`).replace(/\/+$/, '');

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const signToken = (date: string, nonce: string, expiresAt: number): string => {
  return createHmac('sha256', QR_SECRET)
    .update(`${date}:${nonce}:${expiresAt}`)
    .digest('hex');
};

const computeWindowExpiry = (intervalMinutes: number): number => {
  const now = Date.now();
  const intervalMs = intervalMinutes * 60 * 1000;
  const windowStart = Math.floor(now / intervalMs) * intervalMs;
  return windowStart + intervalMs;
};

export interface QrCodeData {
  payload: string;
  dataUrl: string;
  expiresAt: number;
  intervalMinutes: number;
  generatedAt: number;
}

export const generateQrCodeData = async (intervalMinutes: number): Promise<QrCodeData> => {
  const expiresAt = computeWindowExpiry(intervalMinutes);
  const now = Date.now();
  const date = formatDate(new Date(now));
  const nonce = randomBytes(8).toString('hex');
  const token = signToken(date, nonce, expiresAt);

  const payload: QrTokenPayload = { date, nonce, expires_at: expiresAt, token };
  const payloadString = JSON.stringify(payload);
  const scanUrl = `${APP_URL}/teacher/confirm?qr_token=${encodeURIComponent(payloadString)}`;
  const dataUrl = await QRCode.toDataURL(scanUrl, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#ffffff' },
  });

  return {
    payload: payloadString,
    dataUrl,
    expiresAt,
    intervalMinutes,
    generatedAt: now,
  };
};

export const verifyQrToken = (payloadString: string): { valid: boolean; date?: string; expired: boolean } => {
  try {
    const payload = JSON.parse(payloadString) as Partial<QrTokenPayload>;
    if (
      typeof payload.date !== 'string'
      || typeof payload.nonce !== 'string'
      || payload.nonce.length === 0
      || typeof payload.expires_at !== 'number'
      || !Number.isFinite(payload.expires_at)
      || typeof payload.token !== 'string'
    ) {
      return { valid: false, expired: false };
    }

    const expectedToken = signToken(payload.date, payload.nonce, payload.expires_at);
    if (payload.token !== expectedToken || payload.date !== formatDate(new Date())) {
      return { valid: false, expired: false };
    }

    return { valid: true, date: payload.date, expired: Date.now() >= payload.expires_at };
  } catch {
    return { valid: false, expired: false };
  }
};

