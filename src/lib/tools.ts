import type { LucideIcon } from "lucide-react";
import { Image } from "lucide-react";

export type Tool = {
  name: string;
  slug: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const tools: Array<Tool> = [
  {
    name: "YouTube Thumbnail Grabber",
    slug: "youtube-thumbnail-grabber",
    description: "Paste a URL, get the thumbnail in full resolution.",
    href: "/tools/youtube-thumbnail-grabber",
    icon: Image,
  },
];
