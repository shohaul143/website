import { describe, expect, it } from "vite-plus/test";

import { setUpdatedAt } from "./updated-at";

const source = `---
title: "A post"
publishedAt: "2026-11-01"
---

Body.
`;

describe("setUpdatedAt", () => {
  it("adds updatedAt when the field is missing", () => {
    expect(setUpdatedAt(source, "2026-11-05")).toBe(`---
title: "A post"
publishedAt: "2026-11-01"
updatedAt: "2026-11-05"
---

Body.
`);
  });

  it("replaces an existing updatedAt value and leaves the rest alone", () => {
    const withDate = source.replace("publishedAt", 'updatedAt: "2026-11-02"\npublishedAt');
    const result = setUpdatedAt(withDate, "2026-11-05");

    expect(result).toContain('updatedAt: "2026-11-05"');
    expect(result).not.toContain("2026-11-02");
    expect(result).toContain('publishedAt: "2026-11-01"');
    expect(result).toContain("Body.");
  });

  it("does nothing when the date already matches", () => {
    const withDate = source.replace("publishedAt", 'updatedAt: "2026-11-05"\npublishedAt');

    expect(setUpdatedAt(withDate, "2026-11-05")).toBeUndefined();
  });

  it("ignores files without frontmatter", () => {
    expect(setUpdatedAt("# Just a heading\n", "2026-11-05")).toBeUndefined();
  });
});
