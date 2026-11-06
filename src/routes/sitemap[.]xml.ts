import { createFileRoute } from "@tanstack/react-router";

import { renderSitemap, textResponse } from "#/lib/posts/feeds";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => textResponse(renderSitemap(), "application/xml"),
    },
  },
});
