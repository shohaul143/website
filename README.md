# TanStack Starter

Opinionated starter for [TanStack Start](https://tanstack.com/start) with preconfigured tooling and UI components.

## What's included

- **TanStack**: Start, Router, Form, Query, Devtools (disabled by default — see [Devtools](#devtools))
- **UI**: Tailwind CSS 4, Base UI, shadcn, Lucide icons
- **Tooling**: Vite+, TypeScript, React Compiler
- **Deployment**: Cloudflare Workers (configured)

## Getting started

```bash
vp install
vp dev
```

Build for production:

```bash
vp build
```

## Deployment

Configured for Cloudflare Workers via `wrangler.jsonc`.

### Deploy from your machine

```bash
wrangler login
pnpm run deploy
```

The `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in `.env.example` are for CI/CD only. Keep them out of your local `.env` file — `wrangler login` handles authentication for manual deploys.

### App runtime secrets

Use `wrangler secret put SECRET_NAME` for values your Worker needs at runtime (API keys, database credentials). Never put deploy credentials or account tokens in `wrangler secret`.

Public configuration goes in `wrangler.jsonc` under `vars`.

> **Important:** `vp build` copies your `.env` file into `dist/server/.dev.vars`. Do not share the `dist/` folder if it contains secrets.

## TanStack Query

TanStack Query adds client-side caching, background refetching, and mutation state across routes. It's installed and wired into the router for SSR.

The client is created inside `getRouter()` in `src/router.tsx`, so each request gets its own cache. `setupRouterSsrQueryIntegration` supplies the Query provider and handles dehydration and hydration:

```tsx
import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  setupRouterSsrQueryIntegration({ router, queryClient });
  return router;
}
```

The root route provides the `queryClient` type to child routes:

```tsx
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({/* ... */}),
  component: SiteLayout,
  shellComponent: RootDocument,
});
```

Use `context.queryClient` in route loaders and `useSuspenseQuery` in components. See the [TanStack Query guide](https://tanstack.com/start/latest/docs/framework/react/guide/tanstack-query) for usage patterns.

## File-based routing

Routes live in `src/routes/`. TanStack Router auto-generates types. See [TanStack Router docs](https://tanstack.com/router) for routing, loaders, and server functions.

## Devtools

TanStack Devtools is disabled so there's no floating devtools button. The `devtools()` Vite plugin is commented out in `vite.config.ts` (packages remain installed), so enabling it is a single component.

Add this to the `RootDocument` body in `src/routes/__root.tsx`, right after `{children}`:

```tsx
import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

// ...inside <body>
<TanStackDevtools
  config={{ position: "bottom-right" }}
  plugins={[{ name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> }]}
/>;
```

To remove the devtools code entirely, also remove the `devtools()` plugin from `vite.config.ts` and uninstall `@tanstack/react-devtools` and `@tanstack/react-router-devtools`.

## Resources

- [TanStack Start](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
- [Tailwind CSS](https://tailwindcss.com)
- [Cloudflare Workers](https://developers.cloudflare.com/workers)
