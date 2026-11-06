import { absoluteUrl, postUrl, site } from "../site";
import { lastModified, toIsoDateTime, type PostMeta } from "./utils";

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function postJsonLd(post: PostMeta) {
  const url = postUrl(post.slug);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: [absoluteUrl(post.coverImage)],
    datePublished: toIsoDateTime(post.publishedAt),
    dateModified: toIsoDateTime(lastModified(post)),
    author: {
      "@type": "Person",
      name: site.author.name,
      url: site.author.url,
    },
    publisher: {
      "@type": "Person",
      name: site.author.name,
      url: site.author.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: post.tags.join(", "),
    url,
  };
}

export function postHead(post: PostMeta) {
  const url = postUrl(post.slug);
  const image = absoluteUrl(post.coverImage);

  return {
    meta: [
      { title: `${post.title} | ${site.name}` },
      { name: "description", content: post.description },
      { name: "author", content: site.author.name },
      { property: "og:type", content: "article" },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.description },
      { property: "og:url", content: url },
      { property: "og:site_name", content: site.name },
      { property: "og:image", content: image },
      { property: "og:image:alt", content: post.coverImageAlt },
      { property: "og:image:width", content: String(post.coverImageWidth) },
      { property: "og:image:height", content: String(post.coverImageHeight) },
      { property: "article:published_time", content: toIsoDateTime(post.publishedAt) },
      { property: "article:modified_time", content: toIsoDateTime(lastModified(post)) },
      { name: "keywords", content: post.tags.join(", ") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: post.title },
      { name: "twitter:description", content: post.description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: post.coverImageAlt },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: serializeJsonLd(postJsonLd(post)),
      },
    ],
  };
}

const blogIndexDescription = `I write stuff... sometimes — ${site.name}.`;

export function blogIndexHead() {
  const url = absoluteUrl("/posts");

  return {
    meta: [
      { title: `Writing | ${site.name}` },
      { name: "description", content: blogIndexDescription },
      { property: "og:type", content: "website" },
      { property: "og:title", content: `Writing | ${site.name}` },
      { property: "og:description", content: blogIndexDescription },
      { property: "og:url", content: url },
      { property: "og:site_name", content: site.name },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: `Writing | ${site.name}` },
      { name: "twitter:description", content: blogIndexDescription },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
