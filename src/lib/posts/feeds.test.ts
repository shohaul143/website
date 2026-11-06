import { describe, expect, it } from "vite-plus/test";

import { absoluteUrl, site } from "../site";
import { renderRobots, renderRss, renderSitemap, textResponse } from "./feeds";

describe("feeds", () => {
  it("lists every static route in the sitemap", () => {
    const sitemap = renderSitemap();

    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain(`<loc>${absoluteUrl("/")}</loc>`);
    expect(sitemap).toContain(`<loc>${absoluteUrl("/posts")}</loc>`);
    expect(sitemap).toContain(`<loc>${absoluteUrl("/tools")}</loc>`);
    expect(sitemap).toContain(`<loc>${absoluteUrl("/tools/youtube-thumbnail-grabber")}</loc>`);
  });

  it("points robots.txt at the generated sitemap", () => {
    expect(renderRobots()).toBe(
      ["User-agent: *", "Allow: /", "", `Sitemap: ${absoluteUrl("/sitemap.xml")}`, ""].join("\n"),
    );
  });

  it("declares the feed URL and site identity in the RSS channel", () => {
    const rss = renderRss();

    expect(rss).toContain(`<title>${site.name}</title>`);
    expect(rss).toContain(`<link>${absoluteUrl("/posts")}</link>`);
    expect(rss).toContain(`<atom:link href="${absoluteUrl("/rss.xml")}"`);
  });

  it("serves text with the requested content type", async () => {
    const response = textResponse("hello", "text/plain");

    expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(await response.text()).toBe("hello");
  });
});
