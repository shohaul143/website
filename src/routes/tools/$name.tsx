import { createFileRoute, notFound } from "@tanstack/react-router";

import { YouTubeThumbnailGrabber } from "#/components/tools/youtube-thumbnail-grabber";

export const Route = createFileRoute("/tools/$name")({
  loader: ({ params }) => {
    const isYt = params.name === "youtube-thumbnail-grabber" || params.name === "yt-thumbnail";
    if (!isYt) {
      throw notFound();
    }
    return { name: params.name };
  },
  head: () => ({
    meta: [
      { title: "YouTube Thumbnail Grabber | Shohaul" },
      {
        name: "description",
        content: "Download high-resolution YouTube video thumbnails in HD, SD, and HQ.",
      },
    ],
  }),
  component: ToolPage,
});

function ToolPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          YouTube Thumbnail Grabber
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Paste any YouTube video link or ID to preview and download full-resolution thumbnails.
        </p>
      </div>

      <YouTubeThumbnailGrabber />
    </div>
  );
}
