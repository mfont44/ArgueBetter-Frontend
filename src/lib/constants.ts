/** Category IDs sent to the API — display labels via i18n (`categories.{id}`). */
export const CATEGORIES = [
  { id: "work_career", icon: "💼" },
  { id: "clients_freelance", icon: "🤝" },
  { id: "partner_relationships", icon: "💬" },
  { id: "family_friends", icon: "🏠" },
] as const;

export const DEFAULT_DIFFICULTY = 3;

export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5] as const;

/** Tone IDs sent to the API — display via i18n (`tones.{id}`). */
export const TONES = [
  { id: "clear_direct" },
  { id: "soft_empathetic" },
  { id: "firm_respectful" },
  { id: "professional" },
  { id: "conciliatory" },
  { id: "brief" },
] as const;

/** Role values sent to the API — display via i18n (`roles.{value}`). */
export const ROLES = [
  "Manager",
  "Client",
  "Partner",
  "Ex-partner",
  "Friend",
  "Family member",
  "Coworker",
  "Other",
] as const;

/** Tag values sent to the API — display via i18n (`tags.{value}`). */
export const PERSONALITY_TAGS = [
  "Calm and understanding",
  "Cold and distant",
  "Explosive / quick to anger",
  "Manipulative",
  "Passive-aggressive",
  "Very rational",
  "Very emotional",
  "Avoids conflict",
  "Strict but fair",
  "Difficult manager",
  "Demanding but fair client",
  "Deflects blame",
  "Doesn't listen well",
] as const;

const GENERIC_TAGS = [
  "Calm and understanding",
  "Cold and distant",
  "Explosive / quick to anger",
  "Manipulative",
  "Passive-aggressive",
  "Very rational",
  "Very emotional",
  "Avoids conflict",
  "Deflects blame",
  "Doesn't listen well",
] as const;

const WORK_TAGS = [
  ...GENERIC_TAGS,
  "Strict but fair",
  "Difficult manager",
] as const;

const CLIENT_TAGS = [
  ...GENERIC_TAGS,
  "Demanding but fair client",
] as const;

const PERSONAL_TAGS = GENERIC_TAGS;

export type CategorySetup = {
  defaultRole: string;
  roles: readonly string[];
  personalityTags: readonly string[];
};

export const CATEGORY_SETUP: Record<string, CategorySetup> = {
  work_career: {
    defaultRole: "Manager",
    roles: ["Manager", "Coworker", "Other"],
    personalityTags: WORK_TAGS,
  },
  clients_freelance: {
    defaultRole: "Client",
    roles: ["Client", "Other"],
    personalityTags: CLIENT_TAGS,
  },
  partner_relationships: {
    defaultRole: "Partner",
    roles: ["Partner", "Ex-partner", "Other"],
    personalityTags: PERSONAL_TAGS,
  },
  family_friends: {
    defaultRole: "Friend",
    roles: ["Friend", "Family member", "Other"],
    personalityTags: PERSONAL_TAGS,
  },
  custom: {
    defaultRole: "Other",
    roles: ROLES,
    personalityTags: GENERIC_TAGS,
  },
};

export function getCategorySetup(category: string): CategorySetup {
  return CATEGORY_SETUP[category] ?? CATEGORY_SETUP.work_career;
}
