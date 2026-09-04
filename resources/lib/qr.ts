export const extractQrTokenFromScan = (rawText: string): string | null => {
  const text = rawText.trim();
  if (!text) return null;

  try {
    const url = new URL(text);
    const token = url.searchParams.get('qr_token');
    if (token) return token;
  } catch {
    // Not a URL — fall through to raw payload check below.
  }

  if (text.startsWith('{')) return text;
  return null;
};
