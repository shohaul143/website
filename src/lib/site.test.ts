import { describe, expect, it } from "vite-plus/test";

import { absoluteUrl, editPostUrl, postUrl, repoUrl, site } from "./site";

describe("site URLs", () => {
  it("builds absolute URLs with a single slash", () => {
    expect(absoluteUrl("/posts")).toBe(`${site.url}/posts`);
    expect(absoluteUrl("posts")).toBe(`${site.url}/posts`);
  });

  it("encodes slugs in post URLs", () => {
    expect(postUrl("hello world")).toBe(`${site.url}/posts/hello%20world`);
  });

  it("builds encoded GitHub edit links from the repository root", () => {
    expect(repoUrl).toBe(`https://github.com/${site.github.owner}/${site.github.repo}`);
    expect(editPostUrl("src/content/posts/my post.mdx")).toBe(
      `${repoUrl}/edit/${site.github.branch}/src/content/posts/my%20post.mdx`,
    );
  });
});
