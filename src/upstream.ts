/** Pinned upstream Paperclip commit (see scripts/upstream-vitest.sh). */
export const UPSTREAM_REPO = "https://github.com/paperclipai/paperclip.git" as const;

/** Frozen at minilab ship time via `git ls-remote … HEAD`. */
export const UPSTREAM_PINNED_SHA =
  "f329b24ee12496e710ad17377ec7716e0eee22ef" as const;

export const UPSTREAM_NPM_PACKAGE = "paperclipai" as const;

/** Upstream Node policy (from paperclip package.json engines). */
export const UPSTREAM_MIN_NODE = "24.11.0" as const;

/**
 * Default keyless gate in scripts/upstream-vitest.sh (fast, no API keys).
 * Set UPSTREAM_FULL_TEST=1 in that script for full `pnpm test` → test:run.
 */
export const UPSTREAM_TEST_COMMAND =
  "pnpm check:node-version && pnpm run test:check-no-git-push && pnpm run test:runner-acceptance" as const;

/** Pass criteria for the default gate (Vitest runner-acceptance + node policy tests). */
export const UPSTREAM_PASS_CRITERIA =
  "Exit code 0 from check:node-version, test:check-no-git-push, and test:runner-acceptance (Vitest). Not Playwright e2e. Optional UPSTREAM_FULL_TEST=1 runs full pnpm test." as const;
