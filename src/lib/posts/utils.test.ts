import { describe, expect, it } from "vite-plus/test";

import {
  escapeXml,
  filterPostsByTag,
  formatPostDate,
  getPostTags,
  lastModified,
  slugFromPath,
  sortPostsNewestFirst,
  toIsoDateTime,
  toRssDate,
} from "./utils";

describe("slugFromPath", () => {
  it("removes the extension from a top-level post", () => {
    expect(slugFromPath("building-my-website.md")).toBe("building-my-website");
    expect(slugFromPath("learning-tanstack-start.mdx")).toBe("learning-tanstack-start");
  });

  it("uses the folder name for index files", () => {
    expect(slugFromPath("cloudflare-notes/index.mdx")).toBe("cloudflare-notes");
  });

  it("rejects nested files that would not fit the single-segment route", () => {
    expect(() => slugFromPath("notes/cloudflare/index.mdx")).toThrow(/Invalid post path/);
    expect(() => slugFromPath("notes/cloudflare.md")).toThrow(/Invalid post path/);
  });
});

describe("dates", () => {
  it("formats and serializes UTC dates", () => {
    expect(formatPostDate("2026-11-05")).toBe("Nov 5, 2026");
    expect(toIsoDateTime("2026-11-05")).toBe("2026-11-05T00:00:00.000Z");
    expect(toRssDate("2026-11-05")).toBe("Thu, 05 Nov 2026 00:00:00 GMT");
  });

  it("prefers updatedAt for last-modified values", () => {
    expect(lastModified({ publishedAt: "2026-11-05" })).toBe("2026-11-05");
    expect(lastModified({ publishedAt: "2026-11-05", updatedAt: "2026-11-08" })).toBe("2026-11-08");
  });
});

describe("sortPostsNewestFirst", () => {
  it("sorts by publication date and then by slug", () => {
    const posts = [
      { slug: "b", publishedAt: "2026-10-01" },
      { slug: "a", publishedAt: "2026-10-01" },
      { slug: "c", publishedAt: "2026-11-01" },
    ];

    expect(sortPostsNewestFirst(posts).map((post) => post.slug)).toEqual(["c", "a", "b"]);
  });
});

describe("tags", () => {
  const posts = [{ tags: ["React", "TanStack Start"] }, { tags: ["react", "Cloudflare"] }];

  it("deduplicates tags case-insensitively", () => {
    expect(getPostTags(posts)).toEqual(["Cloudflare", "React", "TanStack Start"]);
  });

  it("filters tags case-insensitively", () => {
    expect(filterPostsByTag(posts, "REACT")).toHaveLength(2);
    expect(filterPostsByTag(posts, "cloudflare")).toHaveLength(1);
    expect(filterPostsByTag(posts, undefined)).toHaveLength(2);
  });
});

describe("escapeXml", () => {
  it("escapes XML-sensitive characters", () => {
    expect(escapeXml(`A & B < C > "D" 'E'`)).toBe(
      "A &amp; B &lt; C &gt; &quot;D&quot; &apos;E&apos;",
    );
  });
});
