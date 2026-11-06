# hey.shohaul143.workers.dev

Personal website built with TanStack Start, deployed on Cloudflare Workers.

## Tech Stack

- React 19 + TanStack Start (file-based routing, SSR)
- TanStack Router + TanStack Form + TanStack Query
- Tailwind CSS 4 + shadcn/ui (Base UI)
- TypeScript, Vite+, Zod
- Cloudflare Workers (wrangler)

## Development

```bash
# Install dependencies
pnpm install

# Start dev server (port 3000)
pnpm run dev

# Type-check + lint
pnpm run check

# Run tests
pnpm run test

# Generate route tree after adding routes
pnpm run generate-routes
```

## Deploy

```bash
# Login once
wrangler login

# Build and deploy
pnpm run deploy
```

## Writing

Posts live in `src/content/posts` and default to `.md`. Use `.mdx` only when a post genuinely needs an authored React component; both formats go through the same MDX pipeline at build time.

```yaml
---
title: "A post title"
description: "A short summary used for cards and search."
tags:
  - React
draft: false
publishedAt: "2026-11-05"
# updatedAt is added automatically when a committed post is edited.
# coverImage: "/optional-local-or-https-cover.png"
---
```

- `draft: true` keeps a post out of `/posts`, the homepage, the sitemap, RSS, and its own route.
- Images in article content are downloaded and optimized at build time. Generated files live under `public/generated`.
- When no `coverImage` is supplied, a branded social card is generated during the build.
- `pnpm run content:build` regenerates the content collection and image assets without starting Vite.

## Project Structure

```
src/
├── content/posts/   # Markdown and MDX posts
├── routes/          # TanStack file routes (auto-generated route tree)
├── components/ui/   # shadcn/ui components (Base UI variant)
├── components/posts/# Blog cards, article header, and MDX components
├── lib/             # Shared utilities
├── lib/posts/       # Post registry, SEO, image pipeline
├── styles/          # Global styles (shadcn.css theme)
├── router.tsx       # Router configuration
└── routeTree.gen.ts # Generated route tree (do not edit)
```

## Notes

- Uses `vp` (Vite+) for dev/build/check — see `package.json` scripts
- React Compiler enabled; no manual memoization needed
- Cloudflare Workers bindings in `wrangler.jsonc`
- Path aliases: `#/*` → `src/*`
