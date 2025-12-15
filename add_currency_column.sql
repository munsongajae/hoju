ALTER TABLE expenses 
ADD COLUMN currency TEXT DEFAULT 'AUD';

COMMENT ON COLUMN expenses.currency IS 'Currency code: AUD or KRW';
