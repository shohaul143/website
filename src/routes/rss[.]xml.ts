import { createFileRoute } from "@tanstack/react-router";

import { renderRss, textResponse } from "#/lib/posts/feeds";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: () => textResponse(renderRss(), "application/rss+xml"),
    },
  },
});
