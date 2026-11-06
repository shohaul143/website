import { allPosts } from "content-collections";

import { sortPostsNewestFirst, type Post, type PostMeta } from "./utils";

type ContentPost = (typeof allPosts)[number];

function toPostMeta({ html: _html, draft: _draft, ...meta }: ContentPost): PostMeta {
  return meta;
}

function toPost(post: ContentPost): Post {
  return {
    ...toPostMeta(post),
    html: post.html,
  };
}

export function getPublishedPosts(): PostMeta[] {
  return sortPostsNewestFirst(
    allPosts.filter((post) => !post.draft).map((post) => toPostMeta(post)),
  );
}

export function getPublishedPost(slug: string): Post | undefined {
  const post = allPosts.find((candidate) => !candidate.draft && candidate.slug === slug);

  return post ? toPost(post) : undefined;
}

export function getLatestPosts(count: number): PostMeta[] {
  return getPublishedPosts().slice(0, count);
}
