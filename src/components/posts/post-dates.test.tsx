import { describe, expect, it } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";

import { PostDates } from "./post-dates";

describe("PostDates", () => {
  it("renders only the publication date when there is no update", () => {
    const html = renderToStaticMarkup(<PostDates post={{ publishedAt: "2026-11-06" }} />);

    expect(html).toContain("Nov 6, 2026");
    expect(html).not.toContain("Updated");
  });

  it("renders the update date when it differs from the publication date", () => {
    const html = renderToStaticMarkup(
      <PostDates post={{ publishedAt: "2026-11-06", updatedAt: "2026-11-08" }} />,
    );

    expect(html).toContain("Nov 6, 2026");
    expect(html).toContain("Updated");
    expect(html).toContain("Nov 8, 2026");
  });

  it("hides a redundant update date", () => {
    const html = renderToStaticMarkup(
      <PostDates post={{ publishedAt: "2026-11-06", updatedAt: "2026-11-06" }} />,
    );

    expect(html).not.toContain("Updated");
  });
});
