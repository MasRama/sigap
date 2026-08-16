export const up = `
ALTER TABLE subjects ADD COLUMN kkm INTEGER NOT NULL DEFAULT 75;
`;

export const down = `
ALTER TABLE subjects DROP COLUMN kkm;
`;
