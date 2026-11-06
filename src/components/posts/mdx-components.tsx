import type { ComponentProps, ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";
import {
  CircleAlert,
  Info,
  Lightbulb,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

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

type CalloutType = "note" | "tip" | "important" | "warning" | "caution";

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
  important: {
    label: "Important",
    icon: CircleAlert,
    containerClassName: "border-l-purple-500 bg-purple-500/5",
    iconClassName: "text-purple-600 dark:text-purple-400",
    titleClassName: "text-purple-700 dark:text-purple-300",
  },
  warning: {
    label: "Warning",
    icon: TriangleAlert,
    containerClassName: "border-l-amber-500 bg-amber-500/5",
    iconClassName: "text-amber-600 dark:text-amber-400",
    titleClassName: "text-amber-700 dark:text-amber-300",
  },
  caution: {
    label: "Caution",
    icon: OctagonAlert,
    containerClassName: "border-l-red-500 bg-red-500/5",
    iconClassName: "text-red-600 dark:text-red-400",
    titleClassName: "text-red-700 dark:text-red-300",
  },
};

type CalloutProps = {
  children?: ReactNode;
  title?: string;
  type?: CalloutType;
};

export function Callout({ children, title, type = "note" }: CalloutProps) {
  const variant = calloutVariants[type] ?? calloutVariants.note;
  const Icon = variant.icon;

  return (
    <aside className={cn("my-6 border border-l-2 px-4 py-3", variant.containerClassName)}>
      <p
        className={cn(
          "mt-0 mb-1 flex items-start gap-2 text-sm font-medium",
          variant.titleClassName,
        )}
      >
        <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", variant.iconClassName)} />
        <span className="min-w-0">{title ?? variant.label}</span>
      </p>
      <div className="text-sm [&>p]:my-0 [&>p+p]:mt-2">{children}</div>
    </aside>
  );
}

const alertTypes = {
  NOTE: "note",
  TIP: "tip",
  IMPORTANT: "important",
  WARNING: "warning",
  CAUTION: "caution",
} as const satisfies Record<string, CalloutType>;

const alertMarker = /^[ \t]*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:[ \t]*\r?\n)?[ \t]*/i;

function isAlertMarker(value: string): value is keyof typeof alertTypes {
  return value in alertTypes;
}

function isWhitespaceNode(node: ReactNode): boolean {
  return typeof node === "string" && node.trim() === "";
}

function trimWhitespaceNodes(nodes: ReactNode[]): ReactNode[] {
  let start = 0;
  let end = nodes.length;

  while (start < end && isWhitespaceNode(nodes[start])) {
    start += 1;
  }

  while (end > start && isWhitespaceNode(nodes[end - 1])) {
    end -= 1;
  }

  return nodes.slice(start, end);
}

function isEmptyParagraph(node: ReactNode): boolean {
  if (!isValidElement<{ children?: ReactNode }>(node) || node.type !== "p") {
    return false;
  }

  const children = Children.toArray(node.props.children);
  return children.every(isWhitespaceNode);
}

function filterEmptyParagraphs(nodes: ReactNode[]): ReactNode[] {
  return nodes.filter((node) => !isEmptyParagraph(node));
}

function parseAlertBlockquote(children: ReactNode): {
  type: CalloutType;
  children: ReactNode[];
} | null {
  const nodes = Children.toArray(children);
  const firstIndex = nodes.findIndex((node) => !isWhitespaceNode(node));

  if (firstIndex === -1) {
    return null;
  }

  const first = nodes[firstIndex];

  if (!isValidElement<{ children?: ReactNode }>(first) || first.type !== "p") {
    return null;
  }

  const paragraphChildren = Children.toArray(first.props.children);
  const firstText = paragraphChildren[0];

  if (typeof firstText !== "string") {
    return null;
  }

  const match = alertMarker.exec(firstText);

  if (!match) {
    return null;
  }

  const marker = match[1].toUpperCase();

  if (!isAlertMarker(marker)) {
    return null;
  }

  const rest = firstText.slice(match[0].length);

  if (rest.length === 0 && paragraphChildren.length === 1) {
    return {
      type: alertTypes[marker],
      children: trimWhitespaceNodes(
        filterEmptyParagraphs(nodes.filter((_, index) => index !== firstIndex)),
      ),
    };
  }

  const paragraph = cloneElement(first, {
    children: rest.length > 0 ? [rest, ...paragraphChildren.slice(1)] : paragraphChildren.slice(1),
  });
  const content = nodes.map((node, index) => (index === firstIndex ? paragraph : node));

  return {
    type: alertTypes[marker],
    children: trimWhitespaceNodes(filterEmptyParagraphs(content)),
  };
}

export function Blockquote({ children, ...props }: ComponentProps<"blockquote">) {
  const alert = parseAlertBlockquote(children);

  if (alert) {
    return <Callout type={alert.type}>{alert.children}</Callout>;
  }

  return <blockquote {...props}>{children}</blockquote>;
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
  blockquote: Blockquote,
  table: Table,
  thead: TableHead,
  tbody: TableBody,
  th: TableHeadCell,
  td: TableCell,
};
