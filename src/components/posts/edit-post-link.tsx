import { Pencil } from "lucide-react";

import { buttonVariants } from "#/components/ui/button";
import { editPostUrl } from "#/lib/site";
import { cn } from "#/lib/utils";

export function EditPostLink({ sourcePath }: { sourcePath: string }) {
  return (
    <div className="mt-12 border-t pt-6">
      <a
        href={editPostUrl(sourcePath)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "-ml-2.5 gap-2 text-muted-foreground hover:text-foreground",
        )}
      >
        <Pencil aria-hidden="true" className="size-4" />
        Edit this page on GitHub
      </a>
    </div>
  );
}
