-- Practice sessions: group multiple attempts of the same scenario

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS practice_session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_conversations_session
  ON public.conversations(practice_session_id, attempt_number);
