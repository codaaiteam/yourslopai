-- Add prompt_source column to distinguish AI-seeded vs human-submitted prompts
ALTER TABLE youraislop_prompts
  ADD COLUMN IF NOT EXISTS prompt_source text DEFAULT 'ai';

-- Mark existing waiting prompts as human (they were submitted by real users)
UPDATE youraislop_prompts SET prompt_source = 'human' WHERE status = 'waiting';
