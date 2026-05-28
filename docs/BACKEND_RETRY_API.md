# Backend: retry conversation API

The frontend expects `POST /conversations` to accept an optional `retry_of_conversation_id` field.

## Request

```json
{
  "retry_of_conversation_id": "uuid-of-completed-conversation"
}
```

When present, the backend must:

1. Load the source conversation and verify it belongs to the authenticated user and `status = 'completed'`.
2. Copy setup fields: `category`, `title`, `situation_context`, `goal`, `fear`, `desired_tone`, `other_person_role`, `other_person_profile`, `personality_tags`, and **`difficulty`** (from the source conversation; default 3 if missing).
3. **Regenerate** `character_sheet` via the same LLM step as a new create (do not copy the previous attempt's sheet — avoids accumulated drift).
4. Reuse `practice_session_id` from the source conversation.
5. Set `attempt_number = MAX(attempt_number) + 1` for that session.
6. Consume one credit (same as a new conversation).
7. Generate briefing and character sheet; store briefing as the first assistant message (same as normal create).

## Response

Same as normal `POST /conversations`:

```json
{
  "conversation_id": "uuid",
  "briefing": { ... },
  "credits_remaining": 1,
  "difficulty": 3,
  "character_sheet": { ... }
}
```

## Database

Apply migrations in order:

- `001_initial_schema.sql`
- `002_practice_sessions.sql` — `practice_session_id`, `attempt_number`
- `003_simulation_v2.sql` — `difficulty`, `character_sheet`, `conversation_summary`

No changes required to `POST /conversations/{id}/messages` or `POST /conversations/{id}/finish` — each attempt is an isolated conversation for the AI.
