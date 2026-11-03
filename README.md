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

## Project Structure

```
src/
├── routes/          # TanStack file routes (auto-generated route tree)
├── components/ui/   # shadcn/ui components (Base UI variant)
├── lib/             # Shared utilities
├── styles/          # Global styles (shadcn.css theme)
├── router.tsx       # Router configuration
└── routeTree.gen.ts # Generated route tree (do not edit)
```

## Notes

- Uses `vp` (Vite+) for dev/build/check — see `package.json` scripts
- React Compiler enabled; no manual memoization needed
- Cloudflare Workers bindings in `wrangler.jsonc`
- Path aliases: `#/*` → `src/*`
