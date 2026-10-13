/**
 * Keyless CLI smoke: `npx paperclipai@latest` help/onboard docs only (no secrets, no --yes onboard).
 */

export type SmokeResult = {
  ok: boolean;
  commands: { argv: string[]; exitCode: number; stdoutSnippet: string }[];
};

const NPM_PKG = "paperclipai@latest";

export async function runPaperclipSmoke(options?: {
  npx?: string;
  timeoutMs?: number;
}): Promise<SmokeResult> {
  const npx = options?.npx ?? "npx";
  const timeoutMs = options?.timeoutMs ?? 180_000;
  const commands: SmokeResult["commands"] = [];

  const invocations: string[][] = [
    [npx, NPM_PKG, "--help"],
    [npx, NPM_PKG, "onboard", "--help"],
  ];

  for (const argv of invocations) {
    const proc = Bun.spawn({
      cmd: argv,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        // Avoid persisting npm cache paths with tokens; smoke does not use API keys.
        npm_config_update_notifier: "false",
      },
    });

    const timer = setTimeout(() => proc.kill(), timeoutMs);
    const exitCode = await proc.exited;
    clearTimeout(timer);

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const combined = (stdout + stderr).slice(0, 500);

    commands.push({ argv, exitCode, stdoutSnippet: combined });
  }

  const ok = commands.every((c) => c.exitCode === 0);
  return { ok, commands };
}
