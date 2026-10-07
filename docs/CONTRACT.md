# Apex Copilot contract

This package copies the pure behavior of Apex `main` at `2a83f6adc82e13ffb833b325073b0e26b5d62b4b`, which contains merge `bc9d8422970c4308847fa46ea0129733526eded4` (pull request 300). The fixture in `fixtures/shipped-contract.ts` is a frozen copy of the lists. The implementation does not import that fixture. Conformance tests fail if a deny-list token, safe page, or allowed tool drifts.

The React overlay, chat routes, operator-session lookup, `audit_events` inserts, and panel listeners stay in Apex.

## Flags

| Name | Where |
| --- | --- |
| `FEATURE_COPILOT` | Server. `isCopilotFeatureEnabled`. |
| `VITE_FEATURE_COPILOT` | Dashboard build. `isCopilotClientFeatureEnabled`. |

Unset, empty, `"false"`, `"1"`, and `"TRUE"` without the exact trim-and-lowercase match are off. The only enabling value is the trimmed lowercase string `true`. Both helpers default off. Passing an empty env object to the server helper is off, which is the production case: the variables are unset.

## Who may activate the mode

Status, action generation, and audit require the operator dashboard session from a password login. The header name is `x-apex-operator-session`. `adminBearerActivatesCopilot()` is false. `copilotModeAllowed` is true only when the feature flag is on and that session is valid.

`copilotAccessDecision` checks the flag first (`disabled`), then the operator session (`operator_session_required`), then an optional capability token (`capability_required`). Apex does not pass `requireCapability: true` today. A capability token cannot stand in for the operator session.

## Actions

`validateCopilotAction` and `validateCopilotActions` are the only action protocol.

Allowed, all strict objects:

- `navigate` with `page` in the safe-page list below.
- `search` with `page` of `leads` or `contacts`, and `query` trimmed to 1..200 characters.
- `setFilter` with `page` of `leads` or `contacts`, `field` trimmed to 1..64 characters, and `value` a string of at most 200 characters, a boolean, or null.
- `openRecord` with `recordType` exactly `contact` and `id` a UUID.

Safe pages, in order: `command`, `chat`, `mission`, `agents`, `tasks`, `leads`, `contacts`, `territories`, `webinars`, `artifacts`, `scheduled`, `suggestions`, `logs`, `health`, `learning`, `multiapp`, `verify-scale`.

Contact filter fields: `q`, `tag`, `city`, `state`, `verifiedOnly`, `ownerBot`, `replied`, `campaignId`. `doNotContact` is not a contact filter. Lead filter fields: `status`, `pipelineState`, `industry`. A filter outside that set is `not_allowed` with `Filter "<field>" is not allowed on <page>.`

`validateCopilotActions` requires an array. A non-array is `invalid` with `Apex Copilot requires an actions array.` Only the first 10 elements are processed. The rest are dropped.

Deny check runs before schema parse. The candidate name is compacted to lowercase letters and digits. If that string contains any deny token, the result is `denied` with `"<type>" is blocked by the Apex Copilot hard deny policy.`

Deny tokens: `send`, `invite`, `call`, `release`, `confirm`, `approval`, `code`, `killswitch`, `outboundpolicy`, `secret`, `apikey`, `billing`, `payment`, `delete`, `deploy`, `rollback`, `merge`, `user`, `permission`.

Named examples that hit those tokens: `send`, `sendEmail`, `sendSms`, `sendInvite`, `makeOutboundCall`, `releaseSend`, `confirm`, `confirmApproval`, `enterCode`, `setKillSwitch`, `setOutboundPolicy`, `readSecret`, `writeSecret`, `changeBilling`, `makePayment`, `delete`, `deleteRecord`, `deploy`, `rollback`, `mergeContacts`, `changeUser`, `changePermission`.

A known `type` string that fails the schema is `not_allowed` with `"<type>" is not in the Apex Copilot action registry.` Missing or non-string `type` is `invalid` with `Apex Copilot actions require a valid action type and arguments.` Field values are not scanned for deny tokens. Only the action type is.

Sensitive pages are absent from the safe list, so navigation to them is `not_allowed`: `settings`, `pending-sends`, `approvals`, `spend`, `control`, `pipeline`, `sales-ops`.

## Chat tools while Copilot is on

The model may call only:

- `get_pending_approvals`
- `get_recent_goals`
- `get_recent_activity`
- `get_goal_progress`
- `control_dashboard`

`isCopilotChatToolAllowed` is that set. Execution re-checks it. `create_goal`, `approve_pending_approval`, and `cancel_goal` are false.

## Client helpers

`apex-copilot/client` exports the action and panel types, `COPILOT_PANEL_EVENT` (`apex:copilot-panel-action`), `describeCopilotAction`, `copilotActionTarget`, and `isCopilotClientFeatureEnabled`.

Narration:

- navigate: `Opening <page with hyphens turned into spaces>`
- search: `Searching <page> for “<query>”` with curly quotes
- setFilter: `Setting <page> filter <field> to <value>`, and null becomes `any`
- openRecord: `Opening <recordType> <first 8 characters of id>`

Targets:

- navigate: `#nav-` plus a CSS-identifier escape of the page
- search: `[data-copilot-target="<page>-search"]` with the page left unescaped
- setFilter on `q`: the search target
- other setFilter: `[data-copilot-target="<page>-filter-<escaped field>"]`
- openRecord: `[data-copilot-record="<escaped id>"]`

The dashboard still owns the highlight, the ghost cursor, Stop, Esc, the 10-minute idle timer (`COPILOT_IDLE_TIMEOUT_MS`), and the trusted pointer or key handler outside `[data-copilot-control]`. Panel actions use `apex:copilot-panel-action` and must acknowledge. Apex rejects the action when the panel does not acknowledge within 800ms.

## Audit shapes

Builders match the rows Apex inserts. This package does not insert them.

UI row: `organizationId` `apex`, `actorType` `agent`, `actorId` `copilot`, `action` `copilot.ui.<type>`. `navigate`, `search`, and `setFilter` use `entityType` `dashboard_page` and `entityId` the page. `openRecord` uses `entityType` `contact` and `entityId` the id. Metadata is `actor` `copilot`, `onBehalfOf` `Matthew`, `sessionId`, `status` (`queued`, `executed`, `failed`, or `stopped`), the action, and `undoAvailable: false`. `reason` is set only when the caller passes one.

Session row: action `copilot.session.started` or `copilot.session.stopped`, `entityType` `copilot_session`, `entityId` the session id. Metadata always includes `reason`, which may be undefined.

`queuedAuditResult(type, false)` returns `audit_failed` with `Could not queue <type> because its audit event was not recorded.`

## Deferred layers

These APIs exist here and are covered by tests. They do not change `validateCopilotAction`. Apex does not call them yet. A successful call does not authorize a send.

### Capability token

`createCopilotCapabilityStore` issues an in-memory token `ac1.<id>.<hmac-sha256>` bound to service `apex-api`, scope `dashboard-control`, one operator session id, and one tab id. Default lifetime is 15 minutes. The secret must be at least 16 characters. Verify requires the same session and the same tab. `authorizesSend` is false. `operatorSessionStillRequired` is true. `capabilityAuthorizesSend` is always false. Renew deletes the previous id. The token does not replace `x-apex-operator-session`.

### Rate limits

`createCopilotRateLimiter` allows 30 actions in a rolling 60-second window and 200 actions per session id. A rejected consume does not increment either counter. The shipped tool path still only slices a batch to 10. Apex does not call the limiter yet.

### Undo

`undoForCopilotAction` returns a descriptor. It applies nothing. The inverse must itself validate.

- `openRecord` is not reversible.
- `navigate` is reversible only when the previous page is a safe page.
- `search` is reversible only when the previous query trims to 1..200 characters. An empty prior query is not reversible, because clearing a search is not an allow-listed action.
- `setFilter` is reversible only when `valueKnown` is true and the previous value validates for that field.

Shipped audit rows still set `undoAvailable` to false. See GAP.md.

### Do it?

`createDoItChallenge` returns a public challenge whose prompt is exactly `Do it?`, plus a proof that is not on the public object. `satisfyDoItChallenge` returns `model_cannot_satisfy` for `model`, `agent`, and `copilot`, including when they present the proof. A `human` actor can satisfy it with the proof before expiry (2 minutes).

`mediumRiskActionAvailability` is always `available: false`. `mergeContacts` is `hard_denied` because the shipped token `merge` matches. `editCampaign` and `bulkEdit` are `not_wired`. A satisfied challenge does not make `validateCopilotAction` accept them.

### Voice readback

`copilotVoiceReadback` returns `{ type: 'copilot.voice.readback', text, multiStep, confirmBeforeRun, provider: null }`. Multi-step text ends with `Go?`. There is no speech provider in this package.

### Unsupported controls

`fillField` and `setLayout` are documented by `COPILOT_UNSUPPORTED_CONTROLS` and are `not_allowed` if submitted. Lead `openRecord` stays unsupported: Apex `GET /api/leads/:id` returns `{ success, id, status, pipelineState }`.
