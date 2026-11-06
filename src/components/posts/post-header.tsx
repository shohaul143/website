import { PostDates } from "#/components/posts/post-dates";
import { PostTags } from "#/components/posts/post-tags";
import type { PostMeta } from "#/lib/posts/utils";

export function PostHeader({ post }: { post: PostMeta }) {
  return (
    <header>
      <PostDates post={post} />

      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-3 text-pretty text-lg text-muted-foreground">{post.description}</p>

      <PostTags tags={post.tags} linked className="mt-4" />
    </header>
  );
}
