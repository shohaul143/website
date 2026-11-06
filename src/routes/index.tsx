import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ArrowUpRight, Code, Layers } from "lucide-react";

import { interactiveCardClassName } from "#/components/card";
import { PostRow } from "#/components/posts/post-card";
import { ToolCard } from "#/components/tools/tool-card";
import { fetchLatestPosts } from "#/lib/posts/posts.functions";
import { repoUrl, site } from "#/lib/site";
import { tools } from "#/lib/tools";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/")({
  loader: () => fetchLatestPosts(),
  component: Home,
});

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
    href: repoUrl,
    icon: Code,
  },
  {
    name: "tanstack-starter",
    description:
      "Opinionated starter template for TanStack Start with Tailwind CSS 4, shadcn/ui, and Cloudflare Workers.",
    category: "Template",
    href: `https://github.com/${site.github.owner}/tanstack-starter`,
    icon: Layers,
  },
];

function Home() {
  const latestPosts = Route.useLoaderData();

  return (
    <>
      <div className="max-w-xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Hello!</h1>

        <p className="mt-3 max-w-xl text-pretty text-lg text-muted-foreground">
          I'm {site.name}. Welcome to my corner of the internet. There's a bit of everything here,
          including things I spend my time on, from projects and personal interests to ideas,
          experiments, and everything in between. No roadmap, what I ship, I maintain.
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
        <div className="flex items-center justify-between gap-4 border-b pb-2.5">
          <Link
            to="/posts"
            className="group inline-flex items-center gap-1.5 text-lg font-semibold tracking-tight transition-colors hover:text-muted-foreground"
          >
            <span>Latest Writing</span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
            />
          </Link>
          <p className="text-xs text-muted-foreground">Things worth sharing.</p>
        </div>

        {latestPosts.length > 0 ? (
          <ul className="mt-2 divide-y">
            {latestPosts.map((post) => (
              <li key={post.slug}>
                <PostRow post={post} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Nothing published yet.</p>
        )}
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
      className={cn(
        interactiveCardClassName,
        "flex h-full min-h-[148px] flex-col justify-between p-5",
      )}
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
