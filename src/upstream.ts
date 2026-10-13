/** Pinned upstream Paperclip commit (see scripts/upstream-vitest.sh). */
export const UPSTREAM_REPO = "https://github.com/paperclipai/paperclip.git" as const;

/** Frozen at minilab ship time via `git ls-remote … HEAD`. */
export const UPSTREAM_PINNED_SHA =
  "f329b24ee12496e710ad17377ec7716e0eee22ef" as const;

export const UPSTREAM_NPM_PACKAGE = "paperclipai" as const;

/** Upstream Node policy (from paperclip package.json engines). */
export const UPSTREAM_MIN_NODE = "24.11.0" as const;

/** Keyless default test entrypoint in upstream monorepo. */
export const UPSTREAM_TEST_COMMAND = "pnpm test" as const;

/** Pass criteria: Vitest stable runner exits 0 (`test` → `test:run`). */
export const UPSTREAM_PASS_CRITERIA =
  "Exit code 0 from `pnpm test` (runs preflight + Vitest via scripts/run-vitest-stable.mjs). Not Playwright e2e." as const;
