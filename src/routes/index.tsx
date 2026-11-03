import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ArrowUpRight, Code, Layers } from "lucide-react";

import { ToolCard } from "#/components/tools/tool-card";
import { tools } from "#/lib/tools";

export const Route = createFileRoute("/")({ component: Home });

type Project = {
  name: string;
  description: string;
  category: string;
  href: string;
  icon: LucideIcon;
};

const projects: Array<Project> = [
  {
    name: "website",
    description: "Personal website built with TanStack Start, deployed on Cloudflare Workers.",
    category: "Site",
    href: "https://github.com/shohaul143/website",
    icon: Code,
  },
  {
    name: "tanstack-starter",
    description:
      "Opinionated starter template for TanStack Start with Tailwind CSS 4, shadcn/ui, and Cloudflare Workers.",
    category: "Template",
    href: "https://github.com/shohaul143/tanstack-starter",
    icon: Layers,
  },
];

function Home() {
  return (
    <>
      <div className="max-w-xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Shohaul</h1>

        <p className="mt-3 max-w-xl text-pretty text-lg text-muted-foreground">
          A collection of things I spend my time on, from projects and personal interests to ideas,
          experiments, and everything in between.
        </p>
      </div>

      <section className="mt-14">
        <div className="flex items-center justify-between gap-4 border-b pb-2.5">
          <Link
            to="/tools"
            className="group inline-flex items-center gap-1.5 text-lg font-semibold tracking-tight transition-colors hover:text-muted-foreground"
          >
            <span>Tools</span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
            />
          </Link>
          <p className="text-xs text-muted-foreground">Small utilities, nothing fancy.</p>
        </div>

        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {tools.slice(0, 4).map((tool) => (
            <li key={tool.name}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <div className="flex items-baseline justify-between gap-4 border-b pb-2.5">
          <h2 className="text-lg font-semibold tracking-tight">Things I've made</h2>
          <p className="text-xs text-muted-foreground">Side projects and experiments.</p>
        </div>

        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.name}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const Icon = project.icon;

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full min-h-[148px] flex-col justify-between border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-muted/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex size-9 items-center justify-center border text-muted-foreground transition-colors group-hover:text-foreground">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
          {project.category}
        </span>
      </span>

      <span className="block">
        <span className="flex items-center gap-1">
          <span className="text-sm font-medium">{project.name}</span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">{project.description}</span>
      </span>

      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
