ALTER TABLE youraislop_prompts
  ADD COLUMN IF NOT EXISTS reported int DEFAULT 0;
