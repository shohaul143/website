import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { site } from "../site";
import { getLatestPosts, getPublishedPost, getPublishedPosts } from "./posts.server";
import { getPostTags } from "./utils";

export const fetchPostIndex = createServerFn({ method: "GET" }).handler(async () => {
  const posts = getPublishedPosts();

  return {
    posts,
    tags: getPostTags(posts),
  };
});

export const fetchLatestPosts = createServerFn({ method: "GET" }).handler(async () =>
  getLatestPosts(site.latestPostsCount),
);

export const fetchPost = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => getPublishedPost(data.slug) ?? null);
