import { createFileRoute, notFound } from "@tanstack/react-router";

import { EditPostLink } from "#/components/posts/edit-post-link";
import { PostContent } from "#/components/posts/post-content";
import { PostCover } from "#/components/posts/post-cover";
import { PostHeader } from "#/components/posts/post-header";
import { fetchPost } from "#/lib/posts/posts.functions";
import { postHead } from "#/lib/posts/seo";

export const Route = createFileRoute("/posts/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPost({ data: { slug: params.slug } });

    if (!post) {
      throw notFound();
    }

    return post;
  },
  head: ({ loaderData }) => (loaderData ? postHead(loaderData) : {}),
  component: PostPage,
});

function PostPage() {
  const post = Route.useLoaderData();

  return (
    <article>
      <PostHeader post={post} />

      {post.hasCustomCover ? <PostCover post={post} priority className="mt-8 border" /> : null}

      <PostContent html={post.html} />

      <EditPostLink sourcePath={post.sourcePath} />
    </article>
  );
}
