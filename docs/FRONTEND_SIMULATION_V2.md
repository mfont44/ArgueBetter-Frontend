# Frontend: Simulation UX v2

This document describes the frontend changes for setup simplification, difficulty selection, session end UX, and chat layout. It depends on the backend Simulation v2 API (see backend planning for `difficulty`, `character_sheet`, and extended `POST /messages` response).

Backend companion doc: [arguebetter-api/docs/frontend.md](../../arguebetter-api/docs/frontend.md) (amount privacy, difficulty 3, `goal_reached`).

## Backend dependency

| Feature | Backend requirement | Frontend fallback |
|---------|---------------------|-------------------|
| Difficulty slider | `POST /conversations` accepts `difficulty` (1–5) | Sends `difficulty` always; backend may ignore until deployed |
| Session end banner | `should_end`, `end_reason`, `exchange_count` on message response | Defaults: `should_end=false`, `exchange_count=0` |
| Chat header context | `conversations.difficulty` in Supabase | Omits difficulty if column missing |
| Role-play consistency | Prompt + `character_sheet` with `key_facts` / obligations | See [BACKEND_ROLE_ANCHORING.md](./BACKEND_ROLE_ANCHORING.md) |
| Amount privacy in simulation | Backend redacts amounts in simulation prompt until user mentions them in chat | Setup copy explains this; no client-side redaction |

## Amount privacy

- Users **can** write amounts in the setup textarea (sent as `situation_context` / `goal`) for a better briefing and `character_sheet`.
- During **chat simulation**, the backend redacts amounts in the setup block shown to the model and keeps KEY_FACTS qualitative until the user states a figure in the thread.
- The frontend does **not** edit assistant messages to fix role or amount issues — that stays server-side.
- Setup UI includes helper text under the situation field (see [`SetupWizard.tsx`](../src/components/practice/SetupWizard.tsx)).

## Role confusion (IA)

Inverted roles (e.g. asking the user to pay a debt the other person owes) must be fixed in the **backend** prompts and context. The frontend only sends message text via `POST /messages`. Implement the spec in [BACKEND_ROLE_ANCHORING.md](./BACKEND_ROLE_ANCHORING.md).

## Setup form → API mapping

The simplified setup ([`SetupWizard.tsx`](../src/components/practice/SetupWizard.tsx)) maps fields as follows:

| UI field | API field | Notes |
|----------|-----------|-------|
| Conversation title | `title` | Required |
| Situation + goal (one textarea) | `situation_context`, `goal` | Same text in both until backend makes `goal` optional |
| Who are you talking to | `other_person_role` | Required |
| Personality tags + optional description | `personality_tags`, `other_person_profile` | At least one tag or description required |
| Difficulty slider (1–5) | `difficulty` | Default 3; higher = more pushback before agreement |
| Additional information → worries/avoid | `fear` + appended to `situation_context` | Optional (step 1) |
| Additional information → desired tone | `desired_tone` | Default `clear_direct` |

Setup uses two steps: **Your conversation** (title, situation+goal, difficulty, additional info) and **The other person** (role, tags, description).

## Chat UX

- **Layout:** Chat page uses compact shell padding (`mainClassName`) and a flex column so the message area fills most of the viewport height.
- **Header:** Attempt number + role + difficulty (no duplicate End button in header).
- **Input area:** Full-width textarea, then **Send** (primary, large), then **End practice and get feedback** (outline, full width below).
- **Wrap-up hint:** Shown when `exchange_count >= 4` and `should_end` is false.
- **Session end banner:** Shown when API returns `should_end: true` and `end_reason` is not `goal_reached`.
- **Resolution modal:** When the API returns `goal_reached` on an assistant reply, the user can read that message first. The modal appears on their **next Send attempt** (before the message is posted): end practice or send the reply. On the 3rd deferred prompt, practice auto-finishes. See backend [frontend.md](../../arguebetter-api/docs/frontend.md) for rationale.
- **End practice confirm:** Shows `Are you sure you want to end this practice?` before `POST /finish`, except when auto-finishing on the 3rd `goal_reached` or when ending from that modal in force-end mode.

## Components

- [`DifficultySlider.tsx`](../src/components/practice/DifficultySlider.tsx)
- [`SessionEndBanner.tsx`](../src/components/practice/SessionEndBanner.tsx)
- [`ResolutionModal.tsx`](../src/components/practice/ResolutionModal.tsx)

## Types

See [`src/lib/types.ts`](../src/lib/types.ts): `CharacterSheet`, `SendMessageResponse`, `EndReason`, extended `Conversation` and `CreateConversationPayload`.

## Manual test checklist

### Setup and API

1. **Setup**: Create session with difficulty 1 and 5; verify Network payload includes `difficulty`.
2. **Setup**: Submit with only main fields; "Additional information" closed uses default tone `clear_direct`.
3. **Setup**: Combined situation/goal textarea sends same string for `goal` and `situation_context`.

### Chat UI

4. **Chat**: Message area uses most of the screen height (not a small box in the middle).
5. **Chat**: Send is primary and full width below textarea; End is outline below Send.
6. **Chat**: Manual "End practice" shows English confirm before results.
7. **Chat**: After 4+ user messages, "Good point to wrap up soon" appears if not `should_end`.
8. **Legacy backend**: Chat works without new response fields; no banner, no errors.

### Backend simulation behavior (verify with deployed API)

9. **Amount privacy**: Setup with "25€" in situation → first assistant reply should **not** state 25€ if the user did not say it in chat.
10. **Amount in chat**: User states the amount in a message → assistant may use that amount afterward.
11. **Difficulty 3 + debt topic**: At least one non-instant-pay reply before agreement (even with cooperative personality tags).
12. **`goal_reached`**: Assistant agrees to pay → user can read reply; modal on **next Send** (not instantly); **Send my reply** posts the message; **3rd** deferred prompt auto-finishes to results without double confirm.
13. **Other end reasons**: `natural_closure` / `max_exchanges` / `stalemate` show **banner**, not resolution modal.
14. **Roles (backend)**: Friend owes 20€ case — other person never asks user to pay them; no "X now + the rest" for a single fixed debt (see [BACKEND_ROLE_ANCHORING.md](./BACKEND_ROLE_ANCHORING.md)).

## Troubleshooting after prompt optimization

Prompt compaction should be **backend-only**. If the frontend starts showing odd behavior after a prompting change, check these likely sources first:

- **Difficulty feels flatter than before (`1` / `3` / `5` too similar):**
  Usually a backend simulation / `character_sheet` / context-packing issue, not a frontend rendering issue. Frontend only sends `difficulty` on create and displays it in chat header.
- **Wrong role anchoring (`who owes whom`, forgotten corrections, invented obligations):**
  Most likely backend prompt / `KEY_FACTS` / immutable-facts regression. Frontend does not rewrite assistant replies.
- **Language matching degrades:**
  Most likely backend prompt compression or message-history packing. Frontend sends raw user text only.
- **`goal_reached` / `should_end` / finish flow behaves differently:**
  First inspect the `/conversations/{id}/messages` response contract. Frontend behavior depends on `should_end` and `end_reason`.
- **Feedback or `final_script` feels lower quality but shape is still correct:**
  Likely backend one-shot prompt regression in feedback generation.
- **Feedback or `final_script` breaks structurally (missing tabs/empty sections/runtime parsing issues):**
  First inspect the `/conversations/{id}/finish` payload shape against `src/lib/types.ts` and `src/lib/feedback.ts`.
- **Briefing opener disappears in chat or the first assistant message shows raw JSON unexpectedly:**
  Check whether backend still stores the briefing in the expected assistant-message format. Frontend chat currently detects briefing messages heuristically and extracts `suggested_opener` from that stored JSON.

Frontend files to check first when debugging:

- `src/lib/api.ts` for request/response handling and defaults
- `src/lib/types.ts` for expected public response shape
- `src/components/practice/ChatView.tsx` for `should_end`, `goal_reached`, and briefing opener behavior
- `src/components/practice/ChatMessageList.tsx` for briefing-message filtering
- `src/components/practice/ResultsView.tsx` and `src/lib/feedback.ts` for `final_script` / feedback normalization
