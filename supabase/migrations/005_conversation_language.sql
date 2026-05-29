ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en'
  CHECK (language IN ('ca', 'es', 'en'));

COMMENT ON COLUMN public.conversations.language IS
  'UI/output language for AI briefing and feedback: ca, es, or en';
