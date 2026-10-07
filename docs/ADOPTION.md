# Adopting this package in Apex

Apex keeps the React overlay, the chat routes, the operator-session checks, the `audit_events` inserts, and the panel listeners. This change deletes only the duplicated pure helpers and points them at `apex-copilot`.

Do not set `FEATURE_COPILOT` or `VITE_FEATURE_COPILOT` to an enabled value. Leave `.env.example` false. Do not add either name in Railway. Do not deploy.

Pin a commit. Do not float on a branch name. The specifier adopted by draft pull request https://github.com/patriotnewsactivism/Apex/pull/318 is:

```json
"apex-copilot": "github:patriotnewsactivism/apex-copilot#683d8c92e19953a09795139f59d5e849d8826e39"
```

`dist/` is already in that commit, and the package has no `prepare` script. Apex `pnpm-workspace.yaml` runs dependency install scripts only for the packages in `onlyBuiltDependencies` and `allowBuilds`. Do not add `apex-copilot` to either list. Node and Vite load the committed `dist/`.

`minimumReleaseAge` does not apply to a git dependency.

## packages/api-server/package.json

Add the git dependency next to the other dependencies. `zod` stays on the catalog. The server entry imports Zod and `node:crypto`, which the API server already runs.

## packages/dashboard/package.json

Add the same git dependency. Dashboard code imports `apex-copilot/client` only. That entry does not import Zod or Node.

## packages/api-server/src/copilot-actions.ts

Replace the file with this barrel. Keep the path so `routes/chat.ts` and the Copilot tests do not change.

```ts
export {
  COPILOT_HARD_DENY_ACTIONS,
  COPILOT_READ_ONLY_CHAT_TOOL_NAMES,
  COPILOT_SAFE_PAGES,
  COPILOT_SERVER_FLAG,
  copilotActionSchema,
  isCopilotChatToolAllowed,
  isCopilotFeatureEnabled,
  isHardDeniedCopilotAction,
  validateCopilotAction,
  validateCopilotActions,
} from 'apex-copilot';
export type { CopilotAction, CopilotActionValidation } from 'apex-copilot';
```

## packages/dashboard/src/copilot/feature-flag.ts

```ts
export { isCopilotClientFeatureEnabled } from 'apex-copilot/client';
```

## packages/dashboard/src/copilot/actions.ts

`navigate.page` becomes the safe-page union from the package. Current dashboard call sites only read `page` or pass an action the server already validated, so they stay assignable to `string`. Do not construct a navigate action from an unchecked string without narrowing it to `CopilotSafePage`.

```ts
export {
  COPILOT_PANEL_EVENT,
  copilotActionTarget,
  describeCopilotAction,
} from 'apex-copilot/client';
export type {
  CopilotAction,
  CopilotPanelAction,
  CopilotPanelActionResult,
  CopilotPanelEventDetail,
  CopilotUiController,
} from 'apex-copilot/client';
```

## Files that stay as they are

- `packages/api-server/src/routes/chat.ts` (tool filter, operator-session gate, audit inserts, queued-audit rejection)
- `packages/api-server/src/__tests__/copilot-actions.test.ts` (same cases, now executed through the barrel)
- `packages/dashboard/src/App.tsx`
- `packages/dashboard/src/components/FloatingChat.tsx`
- `packages/dashboard/src/components/QuickChat.tsx`
- `packages/dashboard/src/copilot/CopilotOverlay.tsx`
- Contacts and leads panel listeners
- `packages/dashboard/src/lib/api.ts`
- `.env.example`

## Lockfile

From the Apex repo, with pnpm 11.19.0:

```bash
pnpm install --lockfile-only
```

Commit `pnpm-lock.yaml` with the two package manifests.

## Proof

`pnpm --filter @workspace/api-server exec vitest run src/__tests__/copilot-actions.test.ts` and the workspace typecheck. Flags remain off, so production behavior does not change when this is merged later. This adoption is a draft pull request until that proof is green. Do not merge it as part of publishing the contract.
