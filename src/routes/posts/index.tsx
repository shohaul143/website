import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { PostRow } from "#/components/posts/post-card";
import { fetchPostIndex } from "#/lib/posts/posts.functions";
import { blogIndexHead } from "#/lib/posts/seo";
import { filterPostsByTag, normalizeTag } from "#/lib/posts/utils";
import { cn } from "#/lib/utils";

const searchSchema = z.object({
  // A malformed tag (empty, repeated) should show all posts, not throw a 500.
  tag: z.string().trim().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/posts/")({
  validateSearch: searchSchema,
  loader: () => fetchPostIndex(),
  head: () => blogIndexHead(),
  component: PostsPage,
});

const filterClassName =
  "inline-flex items-center border px-2.5 py-1 text-[11px] tracking-wider uppercase transition-colors";

function PostsPage() {
  const { posts, tags } = Route.useLoaderData();
  const { tag } = Route.useSearch();
  const visiblePosts = filterPostsByTag(posts, tag);
  const activeTag = tag ? normalizeTag(tag) : undefined;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Writing</h1>
        <p className="mt-2 max-w-2xl text-pretty text-base text-muted-foreground">
          Thoughts, ideas, and things worth remembering.
        </p>
      </div>

      {tags.length > 0 ? (
        <nav aria-label="Filter posts by tag" className="-mt-4 flex flex-wrap items-center gap-2">
          <Link
            to="/posts"
            search={{ tag: undefined }}
            className={cn(
              filterClassName,
              !activeTag
                ? "border-foreground/30 bg-muted text-foreground"
                : "bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
            )}
          >
            All posts
          </Link>
          {tags.map((item) => (
            <Link
              key={item}
              to="/posts"
              search={{ tag: item }}
              className={cn(
                filterClassName,
                activeTag === normalizeTag(item)
                  ? "border-foreground/30 bg-muted text-foreground"
                  : "bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
              )}
            >
              {item}
            </Link>
          ))}
        </nav>
      ) : null}

      {visiblePosts.length > 0 ? (
        <section aria-label="Published posts">
          <ul className="divide-y border-y">
            {visiblePosts.map((post) => (
              <li key={post.slug}>
                <PostRow post={post} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No posts match{tag ? ` “${tag}”` : " this filter"} yet.
          </p>
          <Link
            to="/posts"
            search={{ tag: undefined }}
            className="mt-4 inline-flex text-sm underline underline-offset-4 hover:text-muted-foreground"
          >
            Show all posts
          </Link>
        </div>
      )}
    </div>
  );
}
