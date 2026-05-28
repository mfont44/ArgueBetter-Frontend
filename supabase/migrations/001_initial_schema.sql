-- ArgueBetter initial schema

CREATE TYPE conversation_status AS ENUM ('active', 'completed');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE user_plan AS ENUM ('free', 'premium');

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  plan user_plan NOT NULL DEFAULT 'free',
  credits INTEGER NOT NULL DEFAULT 2 CHECK (credits >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan, credits)
  VALUES (NEW.id, NEW.email, 'free', 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atomic credit consumption (returns remaining credits or NULL if none)
CREATE OR REPLACE FUNCTION public.consume_credit(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  remaining INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits = credits - 1
  WHERE id = p_user_id AND credits > 0
  RETURNING credits INTO remaining;
  RETURN remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore credit on failed conversation creation
CREATE OR REPLACE FUNCTION public.restore_credit(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  remaining INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits = credits + 1
  WHERE id = p_user_id
  RETURNING credits INTO remaining;
  RETURN remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  situation_context TEXT NOT NULL,
  goal TEXT NOT NULL,
  fear TEXT,
  desired_tone TEXT NOT NULL,
  other_person_role TEXT NOT NULL,
  other_person_profile TEXT NOT NULL,
  personality_tags TEXT[] DEFAULT '{}',
  status conversation_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);

-- Feedback reports
CREATE TABLE public.feedback_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL UNIQUE REFERENCES public.conversations(id) ON DELETE CASCADE,
  clarity_score INTEGER CHECK (clarity_score BETWEEN 1 AND 10),
  assertiveness_score INTEGER CHECK (assertiveness_score BETWEEN 1 AND 10),
  empathy_score INTEGER CHECK (empathy_score BETWEEN 1 AND 10),
  boundaries_score INTEGER CHECK (boundaries_score BETWEEN 1 AND 10),
  summary TEXT NOT NULL,
  strengths JSONB NOT NULL DEFAULT '[]',
  improvements JSONB NOT NULL DEFAULT '[]',
  final_script JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments placeholder
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  amount INTEGER,
  type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles: users read/update own
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Conversations: users read own only
CREATE POLICY conversations_select_own ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Messages: users read via conversation ownership
CREATE POLICY messages_select_own ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

-- Feedback: users read own
CREATE POLICY feedback_select_own ON public.feedback_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

-- Payments: users read own
CREATE POLICY payments_select_own ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Service role bypasses RLS for writes (FastAPI uses service_role key)
