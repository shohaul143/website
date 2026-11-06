import path from "node:path";

export const postsDirectory = "src/content/posts";

export function isInside(root: string, target: string): boolean {
  const relative = path.relative(root, target);

  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
