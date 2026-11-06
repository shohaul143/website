import { Link } from "@tanstack/react-router";

import { interactiveCardClassName } from "#/components/card";
import type { Tool } from "#/lib/tools";
import { cn } from "#/lib/utils";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;

  return (
    <Link
      to="/tools/$name"
      params={{ name: tool.slug }}
      className={cn(interactiveCardClassName, "flex items-center gap-4 px-5 py-4")}
    >
      <span className="flex size-9 shrink-0 items-center justify-center border text-muted-foreground transition-colors group-hover:text-foreground">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium">{tool.name}</span>
        <span className="block text-xs text-muted-foreground">{tool.description}</span>
      </div>
    </Link>
  );
}
