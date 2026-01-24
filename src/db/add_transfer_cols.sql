-- Add transfer specific columns to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS transfer_reason TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS transfer_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE students ALTER COLUMN school_id DROP NOT NULL;
