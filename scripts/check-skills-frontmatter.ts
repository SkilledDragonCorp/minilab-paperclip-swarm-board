#!/usr/bin/env bun
/** CI: validate .claude/skills/.../SKILL.md YAML frontmatter (name + description). */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const SKILLS_ROOT = join(ROOT, ".claude", "skills");

function parseFrontmatter(content: string): Record<string, string> | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const block = match[1];
  const out: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.+)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

let failed = false;

if (!statSync(SKILLS_ROOT, { throwIfNoEntry: false })?.isDirectory()) {
  console.error(`Missing skills directory: ${SKILLS_ROOT}`);
  process.exit(1);
}

for (const name of readdirSync(SKILLS_ROOT)) {
  const skillPath = join(SKILLS_ROOT, name, "SKILL.md");
  try {
    statSync(skillPath);
  } catch {
    console.error(`Expected ${skillPath}`);
    failed = true;
    continue;
  }
  const fm = parseFrontmatter(readFileSync(skillPath, "utf8"));
  if (!fm?.name || !fm?.description) {
    console.error(`${skillPath}: frontmatter must include name and description`);
    failed = true;
  } else {
    console.log(`OK ${skillPath} (name=${fm.name})`);
  }
}

if (failed) process.exit(1);
