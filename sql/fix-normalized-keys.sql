-- Fix existing youraislop_image_cache rows that have no normalized_key
-- by generating one from the linked prompt's prompt_text

UPDATE youraislop_image_cache ic
SET normalized_key = LOWER(TRIM(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      (SELECT p.prompt_text FROM youraislop_prompts p WHERE p.id = ic.prompt_id),
      '\b(a|an|the|is|are|was|were|be|been|being|i|me|my|you|your|he|she|it|we|they|do|does|did|will|would|could|should|can|may|of|in|to|for|with|on|at|by|from|and|or|but|not|that|this|what|how|if|so|just|very|really|about|draw|paint|sketch|make|create|generate|picture|image|photo|please|want|need|give|show|let|some|something)\b',
      '',
      'gi'
    ),
    '\s+', ' ', 'g'
  )
))
WHERE ic.prompt_id IS NOT NULL
  AND (ic.normalized_key IS NULL OR ic.normalized_key = '');
