export const up = `
ALTER TABLE users DROP COLUMN membership_date;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;
`;

export const down = `
ALTER TABLE users DROP COLUMN phone;
ALTER TABLE users DROP COLUMN is_active;
ALTER TABLE users ADD COLUMN membership_date TEXT;
`;
