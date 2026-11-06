import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

import { postsDirectory } from "../src/lib/posts/paths";
import { setUpdatedAt } from "../src/lib/posts/updated-at";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const postPathPattern = new RegExp(`^${escapeRegExp(postsDirectory)}/.+\\.(md|mdx)$`);

function git(args: string[]): string | undefined {
  try {
    return execFileSync("git", args, { encoding: "utf8" });
  } catch {
    return undefined;
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function stagedFiles(): string[] {
  const output = git(["diff", "--cached", "--name-only", "--diff-filter=ACM"]);

  return output ? output.split("\n").filter(Boolean) : [];
}

const date = today();
const files = process.argv.slice(2).length > 0 ? process.argv.slice(2) : stagedFiles();

for (const file of files.filter((candidate) => postPathPattern.test(candidate))) {
  // New files have no HEAD version, so leave their frontmatter untouched.
  if (git(["show", `HEAD:${file}`]) === undefined) {
    continue;
  }

  const staged = git(["show", `:${file}`]);

  if (staged === undefined) {
    continue;
  }

  const source = readFileSync(file, "utf8");

  if (/^(<{7}|={7}|>{7})\s/m.test(source)) {
    console.warn(
      `[posts] Skipped ${file}: contains merge conflict markers. Resolve conflicts first.`,
    );
    continue;
  }

  if (source !== staged) {
    console.warn(
      `[posts] Skipped ${file}: the working tree differs from the staged version. Stage it and try again.`,
    );
    continue;
  }

  const next = setUpdatedAt(source, date);

  if (!next) {
    continue;
  }

  writeFileSync(file, next);
  execFileSync("git", ["add", "--", file]);
  console.log(`[posts] Set updatedAt to ${date} for ${file}`);
}
