import { Link } from "@tanstack/react-router";

import type { Tool } from "#/lib/tools";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;

  return (
    <Link
      to={tool.href}
      className="group flex items-center gap-4 border bg-card px-5 py-4 transition-colors hover:border-foreground/20 hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
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
