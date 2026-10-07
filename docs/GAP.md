# Gaps between the design doc and the merged code

Design: [APEX Upgrades: Design v1 (Oct 3, 2026), section 4](https://docs.google.com/document/d/16j2r_cq-jlmzmxi3pQnRxRtxJHbpb5B4wGGwGzaIbGY/edit).

Shipped code wins. This file records the disagreement. It does not change the contract in [CONTRACT.md](CONTRACT.md). The comparison is Apex `main` `2a83f6adc82e13ffb833b325073b0e26b5d62b4b`, which contains merge `bc9d8422970c4308847fa46ea0129733526eded4`.

1. The design header says nothing in the document has been built. The Copilot MVP merged to Apex `main` on 2026-10-06. Production is serving a later `main` commit that contains that merge, with both flags unset.

2. The design treats merges as medium-risk actions that show a "Do it?" button. The shipped deny token `merge` hard-denies `mergeContacts` before the schema runs. A challenge cannot override that token. `mediumRiskActionAvailability('mergeContacts')` stays `hard_denied`.

3. The design treats campaign edits and bulk edits as medium-risk actions behind that same button. The shipped registry has no `editCampaign` or `bulkEdit` action, so they are `not_allowed`. This package names them, and still returns `not_wired`. They stay unavailable until Apex wires a real control and the human challenge. The model cannot satisfy the challenge.

4. The design logs an undo where possible. `writeCopilotAudit` in `packages/api-server/src/routes/chat.ts` sets `undoAvailable: false`. `buildCopilotUiAuditEvent` keeps that. `undoForCopilotAction` only builds a descriptor for a later wire-up.

5. The design requires a short-lived session token, about 15 minutes, renewed while active, useless to other tabs. The shipped gate is the feature flag plus the operator dashboard session (`x-apex-operator-session`). The admin bearer does not activate the mode. `createCopilotCapabilityStore` implements the token as an inert API. It does not replace the operator session and it does not authorize sends. Apex does not construct the store.

6. The design limits Copilot to 30 actions a minute and 200 a session. The shipped path slices each `control_dashboard` call to 10 actions and has no minute or session counter. `createCopilotRateLimiter` implements 30 and 200. Apex does not call it.

7. The design reads a multi-step change back before it runs ("I'll filter to Tier A Houston and open KHOU. Go?"). The shipped UI narrates in chat after the server returns actions. `copilotVoiceReadback` returns text with `provider: null`. This package does not add a voice provider.

8. The design lists `fillField(formId, field, value)` and `setLayout(...)`. Neither name is in the shipped schema. Both are `not_allowed`, and `COPILOT_UNSUPPORTED_CONTROLS` says no dashboard control exists yet.

9. The design's `openRecord(type, id)` takes a type. The shipped schema allows `recordType: 'contact'` and a UUID only. Lead open stays unsupported because `GET /api/leads/:id` returns `success`, `id`, `status`, and `pipelineState`.

10. The design says the toggle is for Matthew's logged-in session. The shipped check is `requireCopilotOperatorSession` on the operator session header, not a user-id comparison. Audit metadata still sets `onBehalfOf` to `Matthew`.

11. The design's shorthand is `actor = copilot`. The shipped columns are `actorType` `agent`, `actorId` `copilot`, and metadata `actor` `copilot`.

12. The design says screen content is quoted data and never instructions. The shipped chat prompt receives the current page id as screen context. It does not add a quoting layer around on-screen record text.

13. The design posts a session summary of the actions at the end. The shipped chat posts a short stop line for Esc, idle, the toggle, and Stop. It does not append an action recap.

14. The design turns Copilot off on logout or when the tab closes, in addition to Stop, Esc, and 10 minutes idle. Stop, Esc, the idle timer, and trusted pointer or key input outside `[data-copilot-control]` are in the dashboard. There is no `beforeunload` or logout handler that writes `copilot.session.stopped`. Unloading the page drops the in-memory run. A logout that deletes the operator session makes the next Copilot route fail the session gate.

15. The design includes adjusting non-sensitive settings. The shipped safe-page list does not include `settings`. Navigation there is `not_allowed`.

These are implemented in Apex and are not gaps: narration in chat, highlight and ghost cursor, Stop, Esc, the 10-minute idle timer, manual pointer or key priority outside `[data-copilot-control]`, panel acknowledge on `apex:copilot-panel-action`, and rejection when a queued audit insert fails.
