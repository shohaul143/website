import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  ScriptOnce,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";

import { NotFound } from "#/components/not-found";
import { SiteLayout } from "#/components/site-layout";
import appCss from "../styles/app.css?url";
import shadcnCss from "../styles/shadcn.css?url";

const themeScript = `(() => {
  let theme = "dark";
  try {
    if (localStorage.getItem("theme") === "light") theme = "light";
  } catch {}
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
})();`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      // Default is dark, so the browser's pre-CSS canvas is dark too.
      {
        name: "color-scheme",
        content: "dark",
      },
      {
        title: "TanStack Starter",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
      {
        rel: "stylesheet",
        href: shadcnCss,
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: SiteLayout,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

// The inline theme script sets `.dark` before hydration, so the root element
// intentionally differs from the server markup. This only covers <html>
// attributes; hydration mismatches elsewhere still warn normally.
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ScriptOnce>{themeScript}</ScriptOnce>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
