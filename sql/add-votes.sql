-- Add vote columns to prompts table
ALTER TABLE youraislop_prompts
  ADD COLUMN IF NOT EXISTS upvotes int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downvotes int DEFAULT 0;

-- Index for finding top-rated answers (for future sharing/leaderboard)
CREATE INDEX idx_youraislop_prompts_upvotes ON youraislop_prompts (upvotes DESC)
  WHERE status = 'answered';
