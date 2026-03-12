-- 1. Create youraislop_prompts table
CREATE TABLE youraislop_prompts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prompt_text text NOT NULL,
  ask_type text DEFAULT 'text',        -- 'text' | 'image'
  status text DEFAULT 'waiting',       -- 'waiting' | 'answered'
  claimed_at timestamptz,              -- when a larp user claimed this prompt
  response_text text,                  -- human/AI text response
  response_image_url text,             -- human/AI image response
  response_source text,                -- 'human' | 'ai'
  answered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Index for fetching waiting youraislop_prompts efficiently
CREATE INDEX idx_youraislop_prompts_status_created ON youraislop_prompts (status, created_at)
  WHERE status = 'waiting';

-- 2. Add columns to existing image cache table
ALTER TABLE youraislop_image_cache
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'ai',
  ADD COLUMN IF NOT EXISTS prompt_id bigint REFERENCES youraislop_prompts(id);

-- Index for looking up images by prompt_id
CREATE INDEX idx_image_cache_prompt_id ON youraislop_image_cache (prompt_id)
  WHERE prompt_id IS NOT NULL;
