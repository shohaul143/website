import { createFileRoute } from "@tanstack/react-router";

import { ToolCard } from "#/components/tools/tool-card";
import { site } from "#/lib/site";
import { tools } from "#/lib/tools";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      {
        title: `Tools | ${site.name}`,
      },
      {
        name: "description",
        content: "A collection of small browser-based utilities and tools.",
      },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tools</h1>
        <p className="mt-2 text-base text-muted-foreground">Small utilities, nothing fancy.</p>
      </div>

      <section>
        <ul className="grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
