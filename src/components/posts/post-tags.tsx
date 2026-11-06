import { Link } from "@tanstack/react-router";

import { cn } from "#/lib/utils";

type PostTagsProps = {
  tags: string[];
  linked?: boolean;
  className?: string;
};

const tagClassName =
  "inline-flex items-center border bg-muted/40 px-1.5 py-0.5 text-[10px] tracking-wider text-muted-foreground uppercase";

export function PostTags({ tags, linked = false, className }: PostTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <li key={tag}>
          {linked ? (
            <Link
              to="/posts"
              search={{ tag }}
              className={cn(
                tagClassName,
                "transition-colors hover:border-foreground/20 hover:text-foreground",
              )}
            >
              {tag}
            </Link>
          ) : (
            <span className={tagClassName}>{tag}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
