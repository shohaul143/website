import type { PostMeta } from "#/lib/posts/utils";
import { cn } from "#/lib/utils";

export function PostCover({
  post,
  priority = false,
  className,
}: {
  post: Pick<PostMeta, "coverImage" | "coverImageAlt" | "coverImageWidth" | "coverImageHeight">;
  priority?: boolean;
  className?: string;
}) {
  return (
    <img
      src={post.coverImage}
      alt={post.coverImageAlt}
      width={post.coverImageWidth}
      height={post.coverImageHeight}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={cn("aspect-1200/630 w-full object-cover", className)}
    />
  );
}
