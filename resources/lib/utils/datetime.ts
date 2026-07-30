export function timestampToDateInput(ts: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function dateInputToTimestamp(s: string): number {
  if (!s) return 0;
  return new Date(s + 'T00:00:00').getTime();
}

export function timestampToTimeInput(ts: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function timeInputToTimestamp(s: string, dayOfWeek: number): number {
  if (!s) return 0;
  const [hh, mm] = s.split(':').map(Number);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const d = new Date(startOfWeek);
  d.setDate(startOfWeek.getDate() + dayOfWeek);
  d.setHours(hh || 0, mm || 0, 0, 0);
  return d.getTime();
}
