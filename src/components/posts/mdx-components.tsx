import type { ComponentProps, ReactNode } from "react";
import { Info, Lightbulb, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";

import { cn } from "#/lib/utils";

type PostImageProps = {
  src: string;
  srcSetAvif?: string;
  srcSetWebp?: string;
  srcSetJpeg?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  title?: string;
  caption?: string;
  inline?: boolean | string;
  priority?: boolean | string;
  className?: string;
};

function isTruthy(value: boolean | string | undefined): boolean {
  return value === true || value === "true";
}

export function PostImage({
  src,
  srcSetAvif,
  srcSetWebp,
  srcSetJpeg,
  alt = "",
  width,
  height,
  title,
  caption,
  inline,
  priority,
  className,
}: PostImageProps) {
  const isInline = isTruthy(inline);
  const isPriority = isTruthy(priority);
  const sizes = "(min-width: 768px) 768px, calc(100vw - 3rem)";
  const Wrapper = isInline ? "span" : "figure";

  return (
    <Wrapper className={cn(isInline ? "inline-block max-w-full align-middle" : "my-8", className)}>
      <picture>
        {srcSetAvif ? <source type="image/avif" srcSet={srcSetAvif} sizes={sizes} /> : null}
        {srcSetWebp ? <source type="image/webp" srcSet={srcSetWebp} sizes={sizes} /> : null}
        <img
          src={src}
          srcSet={srcSetJpeg || undefined}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          title={title}
          loading={isPriority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={isPriority ? "high" : "auto"}
          className={cn(
            "border bg-muted",
            isInline ? "inline-block h-auto max-w-full" : "h-auto w-full",
          )}
        />
      </picture>
      {!isInline && caption ? (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </Wrapper>
  );
}

type CalloutType = "note" | "tip" | "warning" | "danger";

type CalloutVariant = {
  label: string;
  icon: LucideIcon;
  containerClassName: string;
  iconClassName: string;
  titleClassName: string;
};

const calloutVariants: Record<CalloutType, CalloutVariant> = {
  note: {
    label: "Note",
    icon: Info,
    containerClassName: "border-l-sky-500 bg-sky-500/5",
    iconClassName: "text-sky-600 dark:text-sky-400",
    titleClassName: "text-sky-700 dark:text-sky-300",
  },
  tip: {
    label: "Tip",
    icon: Lightbulb,
    containerClassName: "border-l-emerald-500 bg-emerald-500/5",
    iconClassName: "text-emerald-600 dark:text-emerald-400",
    titleClassName: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    label: "Warning",
    icon: TriangleAlert,
    containerClassName: "border-l-amber-500 bg-amber-500/5",
    iconClassName: "text-amber-600 dark:text-amber-400",
    titleClassName: "text-amber-700 dark:text-amber-300",
  },
  danger: {
    label: "Danger",
    icon: OctagonAlert,
    containerClassName: "border-l-red-500 bg-red-500/5",
    iconClassName: "text-red-600 dark:text-red-400",
    titleClassName: "text-red-700 dark:text-red-300",
  },
};

type CalloutAlias = "info" | "caution" | "error";
type CalloutProps = {
  children?: ReactNode;
  title?: string;
  type?: CalloutType | CalloutAlias;
};

function resolveCalloutType(type: CalloutProps["type"]): CalloutType {
  switch (type) {
    case "note":
    case "tip":
    case "warning":
    case "danger":
      return type;
    case "info":
      return "note";
    case "caution":
      return "warning";
    case "error":
      return "danger";
    default:
      return "note";
  }
}

export function Callout({ children, title, type = "note" }: CalloutProps) {
  const variant = calloutVariants[resolveCalloutType(type)];
  const Icon = variant.icon;

  return (
    <aside
      className={cn("my-6 flex gap-3 border border-l-2 px-4 py-3", variant.containerClassName)}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", variant.iconClassName)} />
      <div className="min-w-0">
        <p className={cn("mt-0 mb-1 text-sm font-medium", variant.titleClassName)}>
          {title ?? variant.label}
        </p>
        <div className="text-sm [&>p]:my-0 [&>p+p]:mt-2">{children}</div>
      </div>
    </aside>
  );
}

function tableAlignClass(align: ComponentProps<"th">["align"]): string {
  if (align === "center") {
    return "text-center";
  }

  if (align === "right") {
    return "text-right";
  }

  return "text-left";
}

function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="not-prose my-6 w-full overflow-x-auto border bg-card">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

function TableHead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("bg-muted/50", className)} {...props} />;
}

function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      className={cn(
        "[&>tr]:transition-colors [&>tr:hover]:bg-muted/30 [&>tr:last-child>td]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableHeadCell({ align, className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "border-b px-4 py-2.5 align-bottom text-xs font-medium tracking-wider text-muted-foreground uppercase",
        tableAlignClass(align),
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ align, className, ...props }: ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "border-b px-4 py-2.5 align-top [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.8125rem] [&_code]:font-normal",
        tableAlignClass(align),
        className,
      )}
      {...props}
    />
  );
}

export const mdxComponents = {
  PostImage,
  Callout,
  table: Table,
  thead: TableHead,
  tbody: TableBody,
  th: TableHeadCell,
  td: TableCell,
};
