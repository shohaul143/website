import type { ComponentType } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { YouTubeThumbnailGrabber } from "#/components/tools/youtube-thumbnail-grabber";
import { site } from "#/lib/site";
import { getTool, type ToolSlug } from "#/lib/tools";

const toolComponents: Record<ToolSlug, ComponentType> = {
  "youtube-thumbnail-grabber": YouTubeThumbnailGrabber,
};

export const Route = createFileRoute("/tools/$name")({
  loader: ({ params }) => {
    const tool = getTool(params.name);

    if (!tool) {
      throw notFound();
    }

    return tool.slug;
  },
  head: ({ params }) => {
    const tool = getTool(params.name);

    return tool
      ? {
          meta: [
            { title: `${tool.name} | ${site.name}` },
            { name: "description", content: tool.description },
          ],
        }
      : {};
  },
  component: ToolPage,
});

function ToolPage() {
  const slug = Route.useLoaderData();
  const tool = getTool(slug);

  if (!tool) {
    return null;
  }

  const ToolComponent = toolComponents[tool.slug];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{tool.name}</h1>
        <p className="mt-2 text-base text-muted-foreground">{tool.description}</p>
      </div>

      <ToolComponent />
    </div>
  );
}
