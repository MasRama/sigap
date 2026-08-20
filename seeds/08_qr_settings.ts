import type SQLiteType from '../app/services/SQLite';

export function run(SQLite: typeof SQLiteType): void {
  const existing = SQLite.one<{ key: string }>`SELECT key FROM app_settings WHERE key = ${'qr_refresh_interval'}`;
  if (existing) return;

  SQLite.exec`
    INSERT INTO app_settings (key, value, updated_at)
    VALUES (${'qr_refresh_interval'}, ${'5'}, ${Date.now()})
  `;
}
