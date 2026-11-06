# Agent Instructions

Make the smallest complete change that solves the request. Read nearby code first, follow existing patterns, and avoid unrelated refactors. Treat the checked-in code and configuration as the source of truth.

## Project

React 19 · TanStack Start/Router · TypeScript · Vite+ · Tailwind CSS 4 · shadcn/ui with Base UI · TanStack Form · Zod · Cloudflare Workers.

- Routes: `src/routes/` (`src/routes/__root.tsx` is the app shell).
- UI components: `src/components/ui/`; shared helpers: `src/lib/`.
- Global styles/theme: `src/styles/shadcn.css`.
- Check `package.json`, `vite.config.ts`, `wrangler.jsonc`, and `components.json` before changing tooling, runtime, or UI setup.

## Working Rules

- **Follow the existing architecture.** Use TanStack file routes, typed route APIs, loaders, and server functions. Do not introduce Next.js conventions. Never hand-edit generated route files.
- **Reuse the UI.** Check `src/components/ui/` before creating components. This project uses shadcn's **Base UI** variant, not Radix; follow the existing wrappers and `.agents/skills/shadcn/SKILL.md`.
- **Style consistently.** Use the existing theme tokens, `cn` from `#/lib/utils`, and `lucide-react`. Keep layouts responsive and controls accessible.
- **Respect SSR and Workers.** Keep browser-only APIs out of server/module scope. Use Cloudflare-supported APIs and bindings; never expose secrets. Do not deploy or change production settings unless asked.
- **Keep TypeScript strict.** Prefer inferred/library types; avoid `any`, unnecessary assertions, and suppressions. React Compiler is enabled, so do not add manual memoization without a clear reason.
- **Validate inputs.** Use TanStack Form for non-trivial forms and Zod for untrusted input. Check `package.json` before using optional packages such as TanStack Query or Table.
- **Keep dependencies and generated files untouched unless needed.** Use the declared package manager; do not create another lockfile or edit `node_modules`, build output, or generated files.

## Working Style — Ponytail (Lazy Senior Dev)

Be lazy about the solution, never about completeness. Prefer the smallest clear change that fully solves the request; skip unrequested features and unrelated refactors. Before editing, read the touched code and trace its callers, tests, fixtures, exports, and config. Consider compatibility and whether data could be lost or exposed.

Choose in this order: existing project pattern/helper, platform or standard-library feature, installed dependency, then the minimum new code. Reuse existing layers and interfaces; avoid speculative abstractions, wrappers, options, dependencies, and boilerplate. For bug fixes, find all callers and fix the shared root cause. Preserve validation and error handling when moving or merging code. Prefer clear code over clever one-liners.

Add a small test or assert-based check for non-trivial new logic; trivial changes need none. Never cut validation at trust boundaries, data-loss protections, security, accessibility, or anything explicitly requested. If a shortcut has a known limit, document it as `shortcut: <the limit>, <when to upgrade>`. Comment only on why something cannot be clear from the code.

At the end, state what you changed and checked, then add 1–2 brief lines saying what you skipped or did not check and any remaining risk.

## Official Documentation

Use the current official docs when an API or configuration is unclear. Check the version installed in `package.json` first; do not copy examples that target a different version.

- [TanStack Start](https://tanstack.com/start/latest/docs/framework/react/overview) · [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview)
- [React](https://react.dev/reference/react)
- [shadcn/ui](https://ui.shadcn.com/docs) · [Base UI](https://base-ui.com/react/overview/about)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Form](https://tanstack.com/form/latest/docs/framework/react) · [Zod](https://zod.dev)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

Before finishing, review the diff, remove debug code and unused imports, run relevant checks, and summarize the change plus any remaining issues.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Running Scripts

Run TypeScript and JavaScript files with `vpx <file>`, for example `vpx ./scripts/seed.ts --dry-run`. It handles enums, decorators, JSX, and tsconfig `paths`, so do not add `tsx` or `ts-node` to run scripts. `vpx --watch <file>` reruns the file when a file it uses changes, in place of `tsx watch`. `vp node <file>` runs plain Node.js.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
