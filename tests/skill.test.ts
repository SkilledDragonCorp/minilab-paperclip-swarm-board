import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SKILL = join(
  import.meta.dir,
  "..",
  ".claude",
  "skills",
  "paperclip-swarm",
  "SKILL.md",
);

describe("paperclip-swarm skill", () => {
  test("exists with name and description frontmatter", () => {
    const content = readFileSync(SKILL, "utf8");
    expect(content).toMatch(/^---\nname:\s*.+\ndescription:\s*.+\n---/s);
    expect(content.toLowerCase()).toContain("budget");
    expect(content.toLowerCase()).toContain("sandbox");
  });
});
