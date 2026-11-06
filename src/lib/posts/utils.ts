export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  coverImage: string;
  coverImageAlt: string;
  coverImageWidth: number;
  coverImageHeight: number;
  hasCustomCover: boolean;
  sourcePath: string;
};

export type Post = PostMeta & {
  html: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Turn a path relative to the posts directory into a URL slug.
 *
 * `cloudflare-notes/index.mdx` becomes `cloudflare-notes`, which keeps the
 * `/posts/$slug` route single-segment. Nested files without an `index` are
 * rejected so a slug never silently falls outside that route.
 */
export function slugFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const withoutExtension = normalized.replace(/\.(md|mdx)$/i, "");
  const slug = withoutExtension.replace(/\/index$/i, "");

  if (!slug || slug.includes("/")) {
    throw new Error(
      `Invalid post path "${filePath}". Post paths must be top-level files (foo.md) or single-level folders (foo/index.md), not nested directories.`,
    );
  }

  return slug;
}

export function parsePostDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatPostDate(value: string): string {
  return dateFormatter.format(parsePostDate(value));
}

export function lastModified(post: Pick<PostMeta, "publishedAt" | "updatedAt">): string {
  return post.updatedAt ?? post.publishedAt;
}

export function sortPostsNewestFirst<T extends Pick<PostMeta, "publishedAt" | "slug">>(
  posts: T[],
): T[] {
  return [...posts].sort((a, b) => {
    const byDate = b.publishedAt.localeCompare(a.publishedAt);
    return byDate !== 0 ? byDate : a.slug.localeCompare(b.slug);
  });
}

export function normalizeTag(tag: string): string {
  return tag.toLowerCase();
}

export function getPostTags(posts: Array<Pick<PostMeta, "tags">>): string[] {
  const tags = new Map<string, string>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const key = normalizeTag(tag);

      if (!tags.has(key)) {
        tags.set(key, tag);
      }
    }
  }

  return [...tags.values()].sort((a, b) => a.localeCompare(b));
}

export function filterPostsByTag<T extends Pick<PostMeta, "tags">>(
  posts: T[],
  tag: string | undefined,
): T[] {
  if (!tag) {
    return posts;
  }

  const normalized = normalizeTag(tag);
  return posts.filter((post) => post.tags.some((postTag) => normalizeTag(postTag) === normalized));
}

export function toIsoDateTime(value: string): string {
  return parsePostDate(value).toISOString();
}

export function toRssDate(value: string): string {
  return parsePostDate(value).toUTCString();
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
