import type { LucideIcon } from "lucide-react";
import { Image } from "lucide-react";

const toolEntries = [
  {
    name: "YouTube Thumbnail Grabber",
    slug: "youtube-thumbnail-grabber",
    description:
      "Paste any YouTube video link or ID to preview and download full-resolution thumbnails.",
    icon: Image,
  },
] as const;

export type ToolSlug = (typeof toolEntries)[number]["slug"];

export type Tool = {
  name: string;
  slug: ToolSlug;
  description: string;
  icon: LucideIcon;
};

export const tools: readonly Tool[] = toolEntries;

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

export function toolPath(slug: string): string {
  return `/tools/${encodeURIComponent(slug)}`;
}
