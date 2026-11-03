import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Atom, Blocks, Cloud, Database, Layers, RouteIcon, Wind } from "lucide-react";

import { githubUrl } from "#/components/site-layout";
import { buttonVariants } from "#/components/ui/button";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

type Tool = {
  name: string;
  description: string;
  category: string;
  href: string;
  icon: LucideIcon;
};

const tools: Array<Tool> = [
  {
    name: "TanStack Start",
    description: "SSR, server functions, and the app shell.",
    category: "Framework",
    href: "https://tanstack.com/start",
    icon: Layers,
  },
  {
    name: "TanStack Router",
    description: "Typed routes, loaders, and search params.",
    category: "Routing",
    href: "https://tanstack.com/router",
    icon: RouteIcon,
  },
  {
    name: "TanStack Query",
    description: "Async state, caching, and SSR hydration.",
    category: "Data",
    href: "https://tanstack.com/query",
    icon: Database,
  },
  {
    name: "React 19",
    description: "Concurrent UI runtime with the compiler.",
    category: "UI",
    href: "https://react.dev",
    icon: Atom,
  },
  {
    name: "Tailwind CSS 4",
    description: "Utility-first styling with design tokens.",
    category: "Styling",
    href: "https://tailwindcss.com",
    icon: Wind,
  },
  {
    name: "shadcn/ui",
    description: "Accessible components on Base UI.",
    category: "Components",
    href: "https://ui.shadcn.com",
    icon: Blocks,
  },
];

const deploy = {
  name: "Cloudflare Workers",
  description: "Runs the app on the edge, with Wrangler for deploys.",
  href: "https://workers.cloudflare.com",
  icon: Cloud,
};

function Home() {
  const DeployIcon = deploy.icon;

  return (
    <>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">TanStack Starter</h1>
        <p className="mt-2.5 text-muted-foreground">
          A working base for React apps built with React 19, TanStack Start and Router, TypeScript,
          Tailwind CSS 4, and shadcn/ui. Deploys to Cloudflare Workers.
        </p>
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "default" }), "mt-4")}
        >
          View source
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>

      <section aria-labelledby="stack-heading" className="mt-6">
        <div className="flex items-baseline justify-between gap-4 border-b pb-2.5">
          <h2 id="stack-heading" className="text-sm font-medium">
            Built with
          </h2>
          <p className="text-xs text-muted-foreground">Core dependencies</p>
        </div>

        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <li key={tool.name}>
              <ToolCard tool={tool} />
            </li>
          ))}

          <li className="sm:col-span-2 lg:col-span-3">
            <a
              href={deploy.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-4 border bg-card px-5 py-3.5 transition-colors hover:border-foreground/20 hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center border text-muted-foreground transition-colors group-hover:text-foreground">
                  <DeployIcon aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <span className="flex items-center gap-1">
                    <span className="text-sm font-medium">{deploy.name}</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    />
                  </span>
                  <span className="block text-xs text-muted-foreground">{deploy.description}</span>
                </div>
              </div>
              <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                Deploy
              </span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;

  return (
    <a
      href={tool.href}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full min-h-[136px] flex-col justify-between border bg-card p-4.5 transition-colors hover:border-foreground/20 hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex size-9 items-center justify-center border text-muted-foreground transition-colors group-hover:text-foreground">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
          {tool.category}
        </span>
      </span>
      <span className="block">
        <span className="flex items-center gap-1">
          <span className="text-sm font-medium">{tool.name}</span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">{tool.description}</span>
      </span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
