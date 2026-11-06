import { formatPostDate, type PostMeta } from "#/lib/posts/utils";
import { cn } from "#/lib/utils";

export function PostDates({
  post,
  stacked = false,
  className,
}: {
  post: Pick<PostMeta, "publishedAt" | "updatedAt">;
  stacked?: boolean;
  className?: string;
}) {
  const updatedAt =
    post.updatedAt && post.updatedAt !== post.publishedAt ? post.updatedAt : undefined;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground",
        stacked && "flex-col items-start gap-y-0.5",
        className,
      )}
    >
      <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
      {updatedAt ? (
        <span>
          {stacked ? "Updated " : "· Updated "}
          <time dateTime={updatedAt}>{formatPostDate(updatedAt)}</time>
        </span>
      ) : null}
    </div>
  );
}
