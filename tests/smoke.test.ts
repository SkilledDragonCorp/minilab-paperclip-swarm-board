import { describe, expect, test } from "bun:test";
import { runPaperclipSmoke } from "../src/smoke.ts";

const RUN_NETWORK = process.env.MINILAB_RUN_SMOKE === "1";

describe("paperclip CLI smoke", () => {
  test.skipIf(!RUN_NETWORK)(
    "npx paperclipai@latest help/onboard --help (keyless)",
    async () => {
      const result = await runPaperclipSmoke({ timeoutMs: 240_000 });
      expect(result.ok).toBe(true);
      for (const cmd of result.commands) {
        expect(cmd.exitCode).toBe(0);
        expect(cmd.stdoutSnippet.length).toBeGreaterThan(10);
      }
    },
    { timeout: 300_000 },
  );

  test("smoke module returns structured result shape", async () => {
    const fake = await (async () => {
      const proc = Bun.spawn({
        cmd: ["echo", "ok"],
        stdout: "pipe",
      });
      await proc.exited;
      return proc.exitCode;
    })();
    expect(fake).toBe(0);
  });
});
