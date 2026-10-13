---
name: paperclip-swarm
description: Operate Paperclip agent swarms with explicit session budgets, platform-enforced limits (not prompt-only rules), and clear separation between Paperclip spend caps and Anthropic Managed Agents / Dynamic Workflows quotas.
---

# Paperclip swarm board

Use this skill when coordinating **multi-agent swarms** with [Paperclip](https://github.com/paperclipai/paperclip) (`npx paperclipai@latest`) or when explaining how **Anthropic Dynamic Workflows** constraints interact with local orchestration.

## Session budgets (do this first)

1. **Set a numeric budget per session** before spawning workers: max turns, max tool calls, max wall-clock minutes, and max estimated spend (USD or token ceiling).
2. **Set a swarm-level cap** that is strictly lower than org/provider limits so one runaway board cannot exhaust the day.
3. **Record budgets in issue/task metadata** (Paperclip issues, Linear, Notion) — not only in the chat transcript.
4. **Stop conditions must be machine-checkable**: e.g. “exit when tests pass” or “stop after N failed deploy attempts,” not vague “when done.”

## Never rely on prompt-only sandbox rules

Prompts like “do not read `.env`” or “never push to main” are **not security controls**. They fail under adversarial or confused agents.

Prefer, in order:

- **Platform budgets and kill switches** (Paperclip runner limits, provider max tokens, workflow step timeouts).
- **CI and git hooks** (gitleaks, branch protection, required checks).
- **Least-privilege credentials** (scoped API keys, short-lived tokens, separate keys per environment).
- **Network and filesystem isolation** where the runner supports it.

Treat prompt instructions as **documentation for well-behaved agents**, not enforcement.

## Paperclip budgets vs Anthropic Managed Agents budgets

| Layer | What it limits | Typical knobs |
| --- | --- | --- |
| **Paperclip** | Tasks, runners, connectors, internal issue/swarm orchestration | Per-company runner concurrency, connector rate limits, local loopback onboarding; spend tracked in your Paperclip instance |
| **Anthropic Managed Agents / Dynamic Workflows** | Model calls, workflow steps, managed runtime quotas | Organization API usage, workflow step caps, managed agent concurrency — **vendor-side** and change with product docs |

**Do not conflate them.** A Paperclip board can stay under your Paperclip caps while still hitting Anthropic org rate limits (or the reverse). Plan **two budget ledgers**: Paperclip operational limits and Anthropic API/workflow limits.

## Dynamic Workflows — limits and hedges

Anthropic **Dynamic Workflows** (managed, graph-style agent flows) evolve quickly. When designing swarms:

- **Hedge latency**: workflow steps may queue; do not assume synchronous fan-out to N agents.
- **Hedge cost**: each branch may invoke models; fan-out multiplies spend — use batching and early-exit gates.
- **Hedge failure modes**: partial step failure can leave sibling branches running; design **compensating stops** (cancel tokens, shared abort flags).
- **Hedge observability**: managed runtimes may not expose full tool traces; mirror critical decisions to your own logs/issues.
- **Hedge portability**: keep a **non-managed fallback path** (single-agent or Paperclip-native runner) for incidents.

When docs and behavior disagree, trust **measured limits** from a dry run (`paperclipai --help`, keyless upstream Vitest in this minilab) and your org’s Anthropic console — not blog summaries alone.

## Keyless verification in this minilab

- Upstream: `bash scripts/upstream-vitest.sh` → pinned Paperclip commit, `pnpm test` (Vitest). **Not** default Playwright e2e.
- CLI docs smoke: `bash scripts/paperclip-smoke.sh` → `--help` and `onboard --help` only (no secrets).

Live onboarding (`onboard --yes`) needs network, loopback, and optional `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` — see repo `.env.example`.

## Quick commands

```bash
bun install
bun test
bun run check:skills
bash scripts/paperclip-smoke.sh
bash scripts/upstream-vitest.sh   # long; clones upstream
```

Built by **SkilledDragon LLC** — [skilleddragon.com](https://skilleddragon.com)
