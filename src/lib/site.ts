/**
 * Single source of truth for site identity and URLs.
 *
 * Update `url`, `github`, and `description` here when the site moves. The
 * layout, sitemap, RSS feed, canonical URLs, robots.txt, and GitHub edit links
 * all read from this file.
 */
export const site = {
  name: "Shohaul",
  description: "Personal website of Shohaul — projects, tools, and notes on building software.",
  url: "https://hey.shohaul143.workers.dev",
  author: {
    name: "Shohaul",
    url: "https://github.com/shohaul143",
  },
  github: {
    owner: "shohaul143",
    repo: "website",
    branch: "main",
  },
  latestPostsCount: 5,
} as const;

const siteUrl = site.url.replace(/\/+$/, "");

export const repoUrl = `https://github.com/${site.github.owner}/${site.github.repo}`;

export function absoluteUrl(pathname: string): string {
  return `${siteUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function postPath(slug: string): string {
  return `/posts/${encodeURIComponent(slug)}`;
}

export function postUrl(slug: string): string {
  return absoluteUrl(postPath(slug));
}

export function editPostUrl(sourcePath: string): string {
  const encodedPath = sourcePath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${repoUrl}/edit/${site.github.branch}/${encodedPath}`;
}
