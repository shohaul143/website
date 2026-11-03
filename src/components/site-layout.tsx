import { Link, Outlet } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";

import { Container } from "#/components/container";
import { Button } from "#/components/ui/button";

const buildDate = new Date(__BUILD_DATE__);
const lastUpdated = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
}).format(buildDate);
const copyrightYear = buildDate.getUTCFullYear();

export const githubUrl = "https://github.com/shohaul143/tanstack-starter";
const githubProfileUrl = "https://github.com/shohaul143";
const freePalestineUrl = "https://www.jewishvoiceforpeace.org";

export function SiteLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <Container>
          <nav aria-label="Main" className="flex h-16 items-center justify-between">
            <Link
              to="/"
              aria-label="TanStack Starter home"
              className="font-signature text-4xl leading-none"
            >
              ts
            </Link>
            <ThemeToggle />
          </nav>
        </Container>
      </header>

      <main className="flex-1">
        <Container className="py-16">
          <Outlet />
        </Container>
      </main>

      <SiteFooter />
    </div>
  );
}

function applyTheme(isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";

  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch {
    // Storage can be blocked; the theme still changes for this page view.
  }
}

function toggleTheme(event: MouseEvent<HTMLButtonElement>) {
  const isDark = !document.documentElement.classList.contains("dark");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!document.startViewTransition || reduceMotion) {
    applyTheme(isDark);
    return;
  }

  // Keyboard activation reports 0,0; start the reveal from the button instead.
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.detail === 0 ? rect.left + rect.width / 2 : event.clientX;
  const y = event.detail === 0 ? rect.top + rect.height / 2 : event.clientY;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = document.startViewTransition(() => applyTheme(isDark));

  void transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});
}

function ThemeToggle() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative"
      aria-label="Toggle color theme"
      title="Toggle color theme"
      onClick={toggleTheme}
    >
      <Sun
        aria-hidden="true"
        className="size-4 rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0"
      />
      <Moon
        aria-hidden="true"
        className="absolute size-4 rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100"
      />
    </Button>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t">
      <Container className="flex items-start justify-between gap-4 py-8">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            © {copyrightYear}{" "}
            <a
              href={githubProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Shohaul
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated <time dateTime={buildDate.toISOString().slice(0, 10)}>{lastUpdated}</time>
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Source
          </a>
          <a
            href={freePalestineUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Free Palestine — Jewish Voice for Peace (opens in a new tab)"
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Free Palestine
          </a>
        </div>
      </Container>
    </footer>
  );
}
