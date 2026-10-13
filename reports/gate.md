# Paperclip swarm board — keyless gate

- **generated_at:** `2026-10-13T15:01:57.104Z`
- **ok:** true
- **steps:** 3/3 passed
- **bun test:** 4 passed · 0 failed (3 files)
- **upstream Vitest (keyless subset):** 19 passed · 0 failed · 0 skipped
- **upstream node:test (no-git-push policy):** exit 0 (no TAP summary printed)
- **smoke (`paperclipai --help`):** ok
- **upstream pin:** `f329b24ee12496e710ad17377ec7716e0eee22ef`
- **elapsed:** 165004 ms (~165 s)
- **bun / node:** 1.4.2 / 26.3.0

## Steps

| step | ok | exit | ms |
| --- | --- | ---: | ---: |
| `bun-test` | pass | 0 | 62 |
| `upstream-vitest` | pass | 0 | 158902 |
| `paperclip-smoke` | pass | 0 | 6040 |

## Command

```bash
bun run report   # = bun run test && bash scripts/upstream-vitest.sh && bash scripts/paperclip-smoke.sh
```
