import { Link } from "@tanstack/react-router";

import { buttonVariants } from "#/components/ui/button";
import { cn } from "#/lib/utils";

export function NotFound() {
  return (
    <section className="fixed inset-0 flex flex-col items-center justify-center text-center overflow-hidden z-50 bg-background">
      <p
        aria-hidden="true"
        className="font-signature text-8xl leading-none text-foreground select-none sm:text-9xl"
      >
        404
      </p>
      <p className="mt-3 max-w-sm text-pretty text-muted-foreground">
        The page you're looking for doesn't exist, or it may have moved.
      </p>
      <Link to="/" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
        Home
      </Link>
    </section>
  );
}
