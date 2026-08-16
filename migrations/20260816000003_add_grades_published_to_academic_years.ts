export const up = `
ALTER TABLE academic_years ADD COLUMN is_grades_published INTEGER NOT NULL DEFAULT 0;
`;

export const down = `
ALTER TABLE academic_years DROP COLUMN is_grades_published;
`;
