-- Track daily usage count per prompt (each prompt can be reused up to 10 times/day)
ALTER TABLE youraislop_prompts
  ADD COLUMN IF NOT EXISTS daily_use_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_use_date date;
