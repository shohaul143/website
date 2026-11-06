import { createFileRoute } from "@tanstack/react-router";

import { renderRobots, textResponse } from "#/lib/posts/feeds";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => textResponse(renderRobots(), "text/plain"),
    },
  },
});
