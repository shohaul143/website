import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { PostDates } from "#/components/posts/post-dates";
import { PostTags } from "#/components/posts/post-tags";
import type { PostMeta } from "#/lib/posts/utils";

export function PostRow({ post }: { post: PostMeta }) {
  return (
    <Link
      to="/posts/$slug"
      params={{ slug: post.slug }}
      className="group grid gap-2 py-4 transition-colors hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6"
    >
      <PostDates post={post} stacked className="sm:pt-1" />

      <span className="min-w-0">
        <span className="flex items-start gap-1.5">
          <span className="font-medium tracking-tight text-balance">{post.title}</span>
          <ArrowUpRight
            aria-hidden="true"
            className="mt-1 size-3 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        </span>
        <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
          {post.description}
        </span>

        <PostTags tags={post.tags} className="mt-3" />
      </span>
    </Link>
  );
}
