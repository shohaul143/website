/**
 * Rewrite the `updatedAt` frontmatter field without touching the rest of the
 * post. Returns `undefined` when there is no frontmatter or the date already
 * matches, so callers can skip writing the file.
 */
export function setUpdatedAt(source: string, date: string): string | undefined {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!frontmatter) {
    return undefined;
  }

  const existing = frontmatter[1].match(/^updatedAt:\s*(.*)$/m);

  if (existing) {
    const value = existing[1].trim().replace(/^["']|["']$/g, "");

    if (value === date) {
      return undefined;
    }

    const nextFrontmatter = frontmatter[1].replace(/^updatedAt:\s*.*$/m, `updatedAt: "${date}"`);

    return source.replace(frontmatter[0], `---\n${nextFrontmatter}\n---`);
  }

  const nextFrontmatter = `${frontmatter[1]}\nupdatedAt: "${date}"`;

  return source.replace(frontmatter[0], `---\n${nextFrontmatter}\n---`);
}
