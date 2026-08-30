export const up = `
CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_confirmations_one_daily
  ON teacher_confirmations (teacher_user_id, confirmation_date)
  WHERE confirmation_date IS NOT NULL;
`;

export const down = `
DROP INDEX IF EXISTS idx_teacher_confirmations_one_daily;
`;
