# minilab-paperclip-swarm-board

**Built by [SkilledDragon LLC](https://skilleddragon.com)** — Bun/TypeScript wrapper, keyless upstream Vitest harness, and Claude skill for Paperclip agent swarms vs Anthropic Dynamic Workflows budgets.

Featured upstream: [paperclipai/paperclip](https://github.com/paperclipai/paperclip) (MIT) · npm: [`paperclipai`](https://www.npmjs.com/package/paperclipai)

## What we built

| Piece | Purpose |
| --- | --- |
| `src/` | Typed constants (pinned upstream SHA, npm package, pass criteria) + keyless `runPaperclipSmoke()` |
| `scripts/upstream-vitest.sh` | Clone pinned Paperclip commit → `corepack enable && pnpm install --frozen-lockfile` → `pnpm test` |
| `scripts/paperclip-smoke.sh` | `npx paperclipai@latest --help` and `onboard --help` (dry docs, no secrets) |
| `.claude/skills/paperclip-swarm/SKILL.md` | Swarm budgets, sandbox hedges, Paperclip vs Anthropic managed limits |
| CI | Pinned checkout/setup-bun, gitleaks 8.30.1, `bun audit`, skill frontmatter, `bun test` |

## What we tested (real commands)

Pin at ship time:

```text
$ git ls-remote https://github.com/paperclipai/paperclip.git HEAD
f329b24ee12496e710ad17377ec7716e0eee22ef	HEAD
```

Local minilab (keyless):

```bash
bun install
bun run check:skills
bun test
bun audit
```

Optional network smoke (downloads npm package; no API keys):

```bash
bash scripts/paperclip-smoke.sh
# or MINILAB_RUN_SMOKE=1 bun test tests/smoke.test.ts
```

Upstream Vitest (long; clones Paperclip):

```bash
bash scripts/upstream-vitest.sh
# Pass criteria: exit 0 from `pnpm test` (Vitest via test:run — not default Playwright e2e)
```

## Setup

- **Node** `>=24.11.0` (see `.nvmrc` → `24` and upstream `engines`)
- **Bun** `>=1.2.0`

```bash
nvm use   # or fnm/mise
bun install
bun run hooks:install   # optional: gitleaks pre-commit
```

Copy `.env.example` → `.env` only if you run **live** onboarding (`npx paperclipai@latest onboard --yes`). CI does not use keys.

## Tutorial

1. Read `.claude/skills/paperclip-swarm/SKILL.md` and set **session + swarm budgets** before spawning agents.
2. Run `bash scripts/paperclip-smoke.sh` to confirm the published CLI prints help without credentials.
3. Run `bash scripts/upstream-vitest.sh` to verify the pinned upstream commit’s keyless Vitest suite on your machine.
4. Import the skill in Claude Code (project `.claude/skills/`) or symlink into Cursor’s Claude skills path — see below.

## Using these skills in Claude Code and Cursor

- **Claude Code**: skills in this repo live at `.claude/skills/paperclip-swarm/SKILL.md`. Open the repo as the project root; Claude Code discovers skills under `.claude/skills/`.
- **Cursor**: use the same path in your workspace (`.claude/skills/…`). Do not duplicate under `.cursor/skills` or `.agents/skills` for this minilab standard.

Run `bun run check:skills` in CI to ensure every skill has `name` and `description` frontmatter.

## API keys (optional, local only)

| Variable | Required for | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Live agent / managed workflow test-drives | Not used by CI or upstream Vitest |
| `OPENAI_API_KEY` | Optional alternate provider during onboarding experiments | Same |

See `.env.example`. Never commit filled-in `.env` files.

## Limitations

- **Dynamic Workflows** product limits change; the skill documents **hedges**, not guaranteed quotas.
- **Upstream Vitest** is heavy (full monorepo install); not run on every CI push by default in this lab — run locally or extend CI if you accept runtime cost.
- **`npx paperclipai@latest`** resolves the current npm version; pin a version in production if you need reproducibility beyond our git SHA pin for source tests.
- Prompt-only “sandbox rules” are **not** a substitute for budgets, hooks, and least-privilege keys.

## Scripts reference

| Script | Command |
| --- | --- |
| Unit tests | `bun test` |
| Upstream | `bun run test:upstream` |
| CLI smoke | `bun run smoke:paperclip` |
| Skills check | `bun run check:skills` |

## License

MIT — see [LICENSE](LICENSE). Upstream Paperclip is MIT separately.
