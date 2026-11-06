import { absoluteUrl, postUrl, site } from "../site";
import { toolPath, tools } from "../tools";
import { getPublishedPosts } from "./posts.server";
import { escapeXml, lastModified, toIsoDateTime, toRssDate } from "./utils";

export function textResponse(body: string, contentType: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export function renderRss(): string {
  const posts = getPublishedPosts();
  const feedUrl = absoluteUrl("/rss.xml");
  const newest = posts
    .map((post) => lastModified(post))
    .sort()
    .at(-1);
  const lastBuildDate = newest ? toRssDate(newest) : new Date().toUTCString();

  const items = posts.map((post) => {
    const url = postUrl(post.slug);

    return [
      "    <item>",
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <description>${escapeXml(post.description)}</description>`,
      `      <pubDate>${toRssDate(post.publishedAt)}</pubDate>`,
      ...(post.updatedAt
        ? [`      <atom:updated>${toIsoDateTime(post.updatedAt)}</atom:updated>`]
        : []),
      ...post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
      "    </item>",
    ].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(site.name)}</title>`,
    `    <link>${escapeXml(absoluteUrl("/posts"))}</link>`,
    `    <description>${escapeXml(site.description)}</description>`,
    "    <language>en</language>",
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

const staticPaths = ["/", "/posts", "/tools", ...tools.map((tool) => toolPath(tool.slug))];

export function renderSitemap(): string {
  const staticUrls = staticPaths.map(
    (pathname) => `  <url><loc>${escapeXml(absoluteUrl(pathname))}</loc></url>`,
  );

  const postUrls = getPublishedPosts().map(
    (post) =>
      `  <url><loc>${escapeXml(postUrl(post.slug))}</loc><lastmod>${lastModified(post)}</lastmod></url>`,
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticUrls,
    ...postUrls,
    "</urlset>",
    "",
  ].join("\n");
}

export function renderRobots(): string {
  return ["User-agent: *", "Allow: /", "", `Sitemap: ${absoluteUrl("/sitemap.xml")}`, ""].join(
    "\n",
  );
}
