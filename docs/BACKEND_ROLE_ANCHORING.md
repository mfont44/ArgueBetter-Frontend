# Backend: Role anchoring and factual consistency

**Status:** Implemented in `arguebetter-api` (simulation prompts, `character_sheet` generation, message labels).

The frontend cannot fix inverted roles (e.g. the simulated person asking the user to pay money the simulated person owes). These rules live in the **backend** simulation prompts and `character_sheet` generation.

Amount redaction during chat simulation (so the other person does not quote € figures until the user mentions them) is also **backend-only**. The setup form may still collect amounts for briefing; see [FRONTEND_SIMULATION_V2.md](./FRONTEND_SIMULATION_V2.md#amount-privacy).

## Problem

When `situation_context` says the friend owes the user 20€, the model sometimes asks the **user** to transfer 20€ to the **other person**. This is a prompt/context issue, not a UI issue.

## System prompt rules (priority order)

1. **Fixed identity:** You are ONLY the other person (`{other_person_role}`). Human messages are from the USER practicing. You never speak as the user.
2. **KEY_FACTS block:** Inject immutable facts extracted at create time (see `character_sheet` below). Example: `The other person owes the user 20€ for gas. The user is asking to be repaid.`
3. **Prohibitions:**
   - Never ask the user to pay you money that you owe them.
   - Never agree to a plan where the user pays you when setup says you owe them.
4. **Corrections:** If the user corrects a fact (e.g. "you owe me 20€"), accept it and keep it for all following turns. Do not revert on the next message.

## Extend `character_sheet` at `POST /conversations`

Add fields when generating the sheet:

```json
{
  "user_goal_one_liner": "User wants to be repaid 20€ for gas",
  "other_person_obligations": ["Owes the user 20€ for gas"],
  "who_owes_whom": "Other person owes user 20€",
  "key_facts": ["Friend owes user 20€", "User is requesting full repayment"]
}
```

Inject the full JSON (or a `KEY_FACTS` text block) on every `POST /messages` call.

## Message history labels (recommended)

When building the LLM message list:

- `User (practicing): {content}`
- `You (as {role}): {content}`

## Regression test

Setup: friend owes 20€, difficulty 1. After 4–6 exchanges, the assistant must **never** ask the user to send 20€ to the other person for that debt. After user says "you owe me 20€", the next reply must acknowledge the debt from the other person's side.
