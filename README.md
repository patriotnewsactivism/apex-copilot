# Apex Copilot

Public contract for Apex Copilot. The running dashboard stays in [patriotnewsactivism/Apex](https://github.com/patriotnewsactivism/Apex). This repository is the source of truth for the pure contract, and it is the home for the v1 layers Apex has not wired yet.

## Status

The MVP is merged in Apex. Production flags are unset, so the mode is off.

Apex adoption is an open draft pull request: https://github.com/patriotnewsactivism/Apex/pull/318. It pins `f272c147f92eb7827e1fb389acc69b6084089df1` and is not merged. It does not turn the mode on.

- Apex pull request: https://github.com/patriotnewsactivism/Apex/pull/300
- Merge commit: [`bc9d8422970c4308847fa46ea0129733526eded4`](https://github.com/patriotnewsactivism/Apex/commit/bc9d8422970c4308847fa46ea0129733526eded4) (head `44fb82f7f7dfb99ecc8f56d30db05e31c3bc964c`, merged 2026-10-06)
- Operator doc: https://github.com/patriotnewsactivism/Apex/blob/main/docs/APEX_COPILOT.md
- Design doc, section 4: https://docs.google.com/document/d/16j2r_cq-jlmzmxi3pQnRxRtxJHbpb5B4wGGwGzaIbGY/edit
- Production health, re-checked 2026-10-07: https://apex.donmatthews.live/health reports `2a83f6adc82e13ffb833b325073b0e26b5d62b4b`. That commit is Apex `main` and contains the merge. Railway service Apex, project APEX, production environment, does not have `FEATURE_COPILOT` or `VITE_FEATURE_COPILOT` set.

When the design doc and the merged Apex code disagree, the merged code wins. Those disagreements are listed in [docs/GAP.md](docs/GAP.md).

## Package

`apex-copilot` is one ESM package for Node 22. TypeScript is strict. The package manager is pnpm 11.19.0.

| Import | Use |
| --- | --- |
| `apex-copilot` | Flag parser, safe pages, Zod action schema, deny list, validation results, read-only chat tool names, audit event shapes, and the deferred gates. |
| `apex-copilot/client` | Dashboard types and narration helpers. This entry does not import Zod, Node crypto, or `process`. |

`dist/` is committed. Apex allows install scripts only for a short built-dependency list, and this package is not on that list, so a consumer install does not run `prepare`.

There is one action protocol. Deferred gates do not accept a second set of actions.

## Docs

- [docs/CONTRACT.md](docs/CONTRACT.md) — shipped behavior and the deferred APIs
- [docs/GAP.md](docs/GAP.md) — design-doc disagreements, with the merged code kept
- [docs/ADOPTION.md](docs/ADOPTION.md) — the Apex change that deletes the duplicated pure helpers

## Flags

`.env.example` sets both flags false. Only the exact trimmed lowercase string `true` enables either flag. `examples/local-dev.env` is a local shell example. It is not production, and it is not loaded by this package, by Apex, or by Railway. Do not copy an enabled value into a production environment.

## Out of scope

OS or desktop control, pixel automation, moving the chat panel or dashboard pages into this repository, outbound email or calls, and any production enablement.
