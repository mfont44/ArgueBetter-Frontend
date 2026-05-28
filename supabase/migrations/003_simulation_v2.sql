-- Simulation v2: difficulty, immutable character sheet, optional rolling summary (v1.1)

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS difficulty SMALLINT NOT NULL DEFAULT 3
    CHECK (difficulty BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS character_sheet JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS conversation_summary TEXT;
