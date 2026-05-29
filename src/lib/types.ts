import type { ApiLanguage } from "./i18n-core";

export type ConversationStatus = "active" | "completed";
export type UserPlan = "free" | "premium";

export interface Profile {
  id: string;
  email: string | null;
  plan: UserPlan;
  /** Sessions remaining; UI label is "sessions", not credits */
  credits: number;
  /** When backend adds period usage, prefer over derived premium usage */
  sessions_used_this_period?: number;
  created_at: string;
}

export interface CharacterSheet {
  role?: string;
  traits?: string[];
  profile_summary?: string;
  motivation_one_liner?: string;
  speech_style?: string;
  likely_objections?: string[];
  red_lines?: string[];
  de_escalation_triggers?: string[];
  forbidden_inventions?: string[];
  user_goal_one_liner?: string;
  other_person_obligations?: string[];
  who_owes_whom?: string | null;
  key_facts?: string[];
}

export type EndReason =
  | "natural_closure"
  | "max_exchanges"
  | "stalemate"
  | "goal_reached";

export interface Conversation {
  id: string;
  user_id: string;
  category: string;
  title: string;
  situation_context: string;
  goal: string;
  fear: string | null;
  desired_tone: string;
  other_person_role: string;
  other_person_profile: string;
  personality_tags: string[];
  practice_session_id: string;
  attempt_number: number;
  status: ConversationStatus;
  difficulty?: number;
  character_sheet?: CharacterSheet;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface FeedbackReport {
  id: string;
  conversation_id: string;
  clarity_score: number;
  assertiveness_score: number;
  empathy_score: number;
  boundaries_score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  final_script: FinalScript;
  created_at: string;
}

export interface FinalScript {
  opening?: string;
  key_points?: string[];
  if_pushback?: string[];
  closing?: string;
  whatsapp_short?: string;
  email_formal?: string;
}

export interface Briefing {
  summary: string;
  objective: string;
  risks: string[];
  key_points: string[];
  suggested_opener: string;
}

export interface CreateConversationPayload {
  category?: string;
  title?: string;
  situation_context?: string;
  goal?: string;
  fear?: string;
  desired_tone?: string;
  other_person_role?: string;
  other_person_profile?: string;
  personality_tags?: string[];
  difficulty?: number;
  language?: ApiLanguage;
  retry_of_conversation_id?: string;
}

export interface CreateConversationResponse {
  conversation_id: string;
  briefing: Briefing;
  credits_remaining?: number;
  difficulty?: number;
  character_sheet?: CharacterSheet;
}

export interface SendMessageResponse {
  assistant_message: string;
  message_id: string;
  turn_count?: number;
  exchange_count?: number;
  should_end?: boolean;
  end_reason?: EndReason | string | null;
  suggested_user_action?: string | null;
}

export interface FinishConversationResponse {
  conversation_id: string;
  clarity_score: number;
  assertiveness_score: number;
  empathy_score: number;
  boundaries_score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  final_script: FinalScript;
}
