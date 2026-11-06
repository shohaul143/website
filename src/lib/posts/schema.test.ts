import { describe, expect, it } from "vite-plus/test";

import { postFrontmatterSchema } from "./schema";

const validFrontmatter = {
  title: "A post",
  description: "Something worth reading",
  tags: ["React"],
  draft: false,
  publishedAt: "2026-11-01",
  content: "Body.",
};

describe("postFrontmatterSchema", () => {
  it("accepts valid frontmatter", () => {
    expect(postFrontmatterSchema.safeParse(validFrontmatter).success).toBe(true);
  });

  it("rejects impossible or non-ISO dates", () => {
    expect(
      postFrontmatterSchema.safeParse({ ...validFrontmatter, publishedAt: "2026-02-30" }).success,
    ).toBe(false);
    expect(
      postFrontmatterSchema.safeParse({ ...validFrontmatter, publishedAt: "01/11/2026" }).success,
    ).toBe(false);
  });

  it("rejects an updatedAt before publishedAt", () => {
    const result = postFrontmatterSchema.safeParse({
      ...validFrontmatter,
      updatedAt: "2026-10-31",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty required text fields", () => {
    expect(postFrontmatterSchema.safeParse({ ...validFrontmatter, title: "  " }).success).toBe(
      false,
    );
    expect(postFrontmatterSchema.safeParse({ ...validFrontmatter, description: "" }).success).toBe(
      false,
    );
  });
});
