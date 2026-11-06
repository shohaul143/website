import { describe, expect, it } from "vite-plus/test";

import { absoluteUrl, site } from "../site";
import { blogIndexHead, postHead } from "./seo";
import type { PostMeta } from "./utils";

const post: PostMeta = {
  slug: "hello-world",
  title: "Hello <World>",
  description: "A post about greetings",
  tags: ["React", "TanStack"],
  publishedAt: "2026-11-01",
  updatedAt: "2026-11-03",
  coverImage: "/generated/social-covers/cover.png",
  coverImageAlt: "Abstract cover",
  coverImageWidth: 1200,
  coverImageHeight: 630,
  hasCustomCover: true,
  sourcePath: "src/content/posts/hello-world.mdx",
};

function metaValue(
  head: { meta: Array<{ property?: string; name?: string; content?: string }> },
  key: string,
): string | undefined {
  const entry = head.meta.find((item) => item.property === key || item.name === key);

  return entry?.content;
}

describe("postHead", () => {
  it("points canonical and social metadata at the absolute post URL", () => {
    const head = postHead(post);

    expect(head.links).toEqual([{ rel: "canonical", href: absoluteUrl("/posts/hello-world") }]);
    expect(metaValue(head, "og:url")).toBe(absoluteUrl("/posts/hello-world"));
    expect(metaValue(head, "og:image")).toBe(absoluteUrl(post.coverImage));
    expect(metaValue(head, "article:modified_time")).toBe("2026-11-03T00:00:00.000Z");
  });

  it("serializes JSON-LD without exposing raw HTML", () => {
    const [script] = postHead(post).scripts;

    expect(script?.children).toContain("\\u003cWorld>");
    expect(JSON.parse(script?.children ?? "{}")).toMatchObject({
      headline: post.title,
      keywords: "React, TanStack",
    });
  });
});

describe("blogIndexHead", () => {
  it("uses the site identity for the index title and canonical URL", () => {
    const head = blogIndexHead();

    expect(metaValue(head, "og:site_name")).toBe(site.name);
    expect(head.links).toEqual([{ rel: "canonical", href: absoluteUrl("/posts") }]);
  });
});
