import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  UPSTREAM_PINNED_SHA,
  UPSTREAM_REPO,
  UPSTREAM_TEST_COMMAND,
} from "../src/upstream.ts";

const ROOT = join(import.meta.dir, "..");

describe("upstream pin", () => {
  test("SHA matches scripts/upstream-vitest.sh", () => {
    const script = readFileSync(
      join(ROOT, "scripts/upstream-vitest.sh"),
      "utf8",
    );
    expect(script).toContain(UPSTREAM_PINNED_SHA);
    expect(script).toContain(UPSTREAM_REPO);
    expect(script).toContain(UPSTREAM_TEST_COMMAND.replace("pnpm ", ""));
  });

  test("SHA is 40-char hex", () => {
    expect(UPSTREAM_PINNED_SHA).toMatch(/^[0-9a-f]{40}$/);
  });
});
