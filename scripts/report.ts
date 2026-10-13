#!/usr/bin/env bun
/**
 * Keyless gate report → reports/gate.json + reports/gate.md
 *
 * Runs, in order, and records pass/fail + elapsed ms per step:
 *   1. `bun run test`                    local minilab unit tests (keyless)
 *   2. `bash scripts/upstream-vitest.sh` pinned Paperclip upstream, keyless Vitest subset
 *                                        (check:node-version + test:check-no-git-push + test:runner-acceptance)
 *   3. `bash scripts/paperclip-smoke.sh` `npx paperclipai@latest --help` / `onboard --help` (dry docs only)
 *
 * No API keys. Never sets UPSTREAM_FULL_TEST=1. Network failures (git clone, npm)
 * are recorded honestly as a failed step with an error tail; the report still writes.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  UPSTREAM_PASS_CRITERIA,
  UPSTREAM_PINNED_SHA,
  UPSTREAM_REPO,
  UPSTREAM_TEST_COMMAND,
} from "../src/upstream.ts";

const ROOT = join(import.meta.dir, "..");
const REPORTS = join(ROOT, "reports");

type Step = {
  id: string;
  command: string;
  ok: boolean;
  exit_code: number;
  elapsed_ms: number;
  error_tail?: string;
  out: string;
};

function run(id: string, cmd: string[]): Step {
  const t0 = performance.now();
  let r: ReturnType<typeof Bun.spawnSync> | null = null;
  let spawnError = "";
  try {
    r = Bun.spawnSync(cmd, {
      cwd: ROOT,
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, UPSTREAM_FULL_TEST: "0", CI: process.env.CI ?? "1" },
    });
  } catch (e) {
    spawnError = String(e);
  }
  const elapsed_ms = Math.round(performance.now() - t0);
  const out = r ? `${r.stdout?.toString() ?? ""}${r.stderr?.toString() ?? ""}` : spawnError;
  const exit_code = r ? (r.exitCode ?? 1) : 127;
  const ok = exit_code === 0;
  const step: Step = { id, command: cmd.join(" "), ok, exit_code, elapsed_ms, out };
  if (!ok) step.error_tail = out.trim().split("\n").slice(-12).join("\n");
  return step;
}

/** `bun test` summary: " 12 pass", " 0 fail", "Ran 12 tests across 3 files." */
function countBunTest(text: string) {
  const pass = Number(text.match(/^\s*(\d+)\s+pass\b/m)?.[1] ?? 0);
  const fail = Number(text.match(/^\s*(\d+)\s+fail\b/m)?.[1] ?? 0);
  const skip = Number(text.match(/^\s*(\d+)\s+skip\b/m)?.[1] ?? 0);
  const ran = text.match(/Ran\s+(\d+)\s+tests?\s+across\s+(\d+)\s+files?/);
  return {
    passed: pass,
    failed: fail,
    skipped: skip,
    total: ran ? Number(ran[1]) : pass + fail + skip,
    files: ran ? Number(ran[2]) : 0,
  };
}

/**
 * Vitest summary lines, summed across every Vitest invocation in the log:
 *   "      Tests  19 passed (19)"
 *   "      Tests  1 failed | 18 passed | 2 skipped (21)"
 * "Test Files  N passed" is captured separately and never mistaken for tests.
 */
function countVitest(text: string) {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let files = 0;
  let runs = 0;
  const summary_lines: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\x1b\[[0-9;]*m/g, "").trim();
    const m = line.match(/^(Tests|Test Files)\s+(.+?)\s*\((\d+)\)\s*$/);
    if (!m) continue;
    const parts = m[2];
    const n = (k: string) => Number(parts.match(new RegExp(`(\\d+)\\s+${k}`))?.[1] ?? 0);
    if (m[1] === "Test Files") {
      files += n("passed") + n("failed");
      continue;
    }
    runs += 1;
    passed += n("passed");
    failed += n("failed");
    skipped += n("skipped");
    summary_lines.push(line);
  }
  return { passed, failed, skipped, files, runs, summary_lines };
}

/** node:test TAP summary ("# pass 3" / "# fail 0") from test:check-no-git-push. */
function countNodeTest(text: string): { passed: number; failed: number } | null {
  const pass = text.match(/^#\s*pass\s+(\d+)/m);
  const fail = text.match(/^#\s*fail\s+(\d+)/m);
  if (!pass && !fail) return null; // no TAP summary printed (quiet reporter); exit code is the signal
  return { passed: Number(pass?.[1] ?? 0), failed: Number(fail?.[1] ?? 0) };
}

/** Pinned SHA as written in the shell script; must equal src/upstream.ts. */
function pinnedShaFromScript(): string {
  const sh = readFileSync(join(ROOT, "scripts", "upstream-vitest.sh"), "utf8");
  return sh.match(/^UPSTREAM_SHA="([0-9a-f]{40})"/m)?.[1] ?? "";
}

const scriptSha = pinnedShaFromScript();
if (scriptSha !== UPSTREAM_PINNED_SHA) {
  console.error(`pin mismatch: scripts/upstream-vitest.sh=${scriptSha} src/upstream.ts=${UPSTREAM_PINNED_SHA}`);
  process.exit(2);
}

const tAll = performance.now();
const unit = run("bun-test", ["bun", "run", "test"]);
const upstream = run("upstream-vitest", ["bash", "scripts/upstream-vitest.sh"]);
const smoke = run("paperclip-smoke", ["bash", "scripts/paperclip-smoke.sh"]);
const elapsed_ms = Math.round(performance.now() - tAll);

const bun_test = countBunTest(unit.out);
const vitest = countVitest(upstream.out);
const node_test = countNodeTest(upstream.out);
const upstreamStages = {
  cloned: /==> corepack enable/.test(upstream.out),
  installed: /==> Keyless gate/.test(upstream.out),
  gate_exited_0: /PASS: upstream keyless test gate exited 0/.test(upstream.out),
};
const upstream_failure_reason = upstream.ok
  ? null
  : !upstreamStages.cloned
    ? "clone/fetch of pinned commit failed (network or git)"
    : !upstreamStages.installed
      ? "pnpm install --frozen-lockfile failed (network or node version)"
      : "keyless Vitest subset exited non-zero";

const steps = [unit, upstream, smoke];
const steps_passed = steps.filter((s) => s.ok).length;
const steps_failed = steps.length - steps_passed;
const ok = steps_failed === 0 && bun_test.failed === 0 && vitest.failed === 0;
const generated_at = new Date().toISOString();

const gate = {
  lab: "minilab-paperclip-swarm-board",
  generated_at,
  elapsed_ms,
  elapsed_s: Math.round(elapsed_ms / 100) / 10,
  keyless: true,
  mode: "keyless-subset",
  mode_note:
    "bun test + documented keyless Vitest subset via scripts/upstream-vitest.sh (UPSTREAM_FULL_TEST unset) + paperclip-smoke.sh (--help only). Full upstream suite omitted.",
  versions: {
    bun: Bun.version,
    node: process.versions.node,
  },
  upstream_repo: UPSTREAM_REPO,
  upstream_commit: UPSTREAM_PINNED_SHA,
  upstream_commit_short: UPSTREAM_PINNED_SHA.slice(0, 7),
  upstream_test_command: UPSTREAM_TEST_COMMAND,
  pass_criteria: UPSTREAM_PASS_CRITERIA,
  ok,
  steps_total: steps.length,
  steps_passed,
  steps_failed,
  bun_test,
  vitest: {
    ok: upstream.ok && vitest.failed === 0,
    exit_code: upstream.exit_code,
    passed: vitest.passed,
    failed: vitest.failed,
    skipped: vitest.skipped,
    files: vitest.files,
    runs: vitest.runs,
    summary_lines: vitest.summary_lines,
  },
  node_test,
  upstream: { ...upstreamStages, failure_reason: upstream_failure_reason },
  smoke_ok: smoke.ok,
  steps: steps.map(({ id, command, ok, exit_code, elapsed_ms, error_tail }) => ({
    id,
    command,
    ok,
    exit_code,
    elapsed_ms,
    ...(error_tail ? { error_tail } : {}),
  })),
  headline: {
    bun_tests_passed: bun_test.passed,
    vitest_passed: vitest.passed,
    vitest_failed: vitest.failed,
    smoke_ok: smoke.ok,
    steps: `${steps_passed}/${steps.length}`,
    upstream_commit: UPSTREAM_PINNED_SHA.slice(0, 7),
    elapsed_ms,
  },
};

mkdirSync(REPORTS, { recursive: true });
writeFileSync(join(REPORTS, "gate.json"), JSON.stringify(gate, null, 2) + "\n");

const md = [
  `# Paperclip swarm board — keyless gate`,
  ``,
  `- **generated_at:** \`${generated_at}\``,
  `- **ok:** ${ok}`,
  `- **steps:** ${steps_passed}/${steps.length} passed`,
  `- **bun test:** ${bun_test.passed} passed · ${bun_test.failed} failed (${bun_test.files} files)`,
  `- **upstream Vitest (keyless subset):** ${vitest.passed} passed · ${vitest.failed} failed · ${vitest.skipped} skipped`,
  `- **upstream node:test (no-git-push policy):** ${node_test ? `${node_test.passed} passed · ${node_test.failed} failed` : "exit 0 (no TAP summary printed)"}`,
  `- **smoke (\`paperclipai --help\`):** ${smoke.ok ? "ok" : "fail"}`,
  `- **upstream pin:** \`${UPSTREAM_PINNED_SHA}\``,
  `- **elapsed:** ${elapsed_ms} ms (~${gate.elapsed_s} s)`,
  `- **bun / node:** ${Bun.version} / ${process.versions.node}`,
  ``,
  `## Steps`,
  ``,
  `| step | ok | exit | ms |`,
  `| --- | --- | ---: | ---: |`,
  ...steps.map((s) => `| \`${s.id}\` | ${s.ok ? "pass" : "FAIL"} | ${s.exit_code} | ${s.elapsed_ms} |`),
  ``,
  ...(upstream_failure_reason ? [`**upstream failure:** ${upstream_failure_reason}`, ``] : []),
  ...(steps.some((s) => s.error_tail)
    ? steps.flatMap((s) => (s.error_tail ? [`### ${s.id} tail`, "```", s.error_tail, "```", ""] : []))
    : []),
  `## Command`,
  ``,
  "```bash",
  `bun run report   # = bun run test && bash scripts/upstream-vitest.sh && bash scripts/paperclip-smoke.sh`,
  "```",
  ``,
];
writeFileSync(join(REPORTS, "gate.md"), md.join("\n"));

console.log(JSON.stringify({ wrote: join(REPORTS, "gate.json"), ok, headline: gate.headline }, null, 2));
process.exit(ok ? 0 : 1);
