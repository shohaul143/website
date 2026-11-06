import type { ReactNode } from "react";
import { describe, expect, it } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";

import { Blockquote, Callout } from "./mdx-components";

function render(type: NonNullable<Parameters<typeof Callout>[0]["type"]>): string {
  return renderToStaticMarkup(<Callout type={type}>Body</Callout>);
}

function renderBlockquote(children: ReactNode): string {
  return renderToStaticMarkup(<Blockquote>{children}</Blockquote>);
}

describe("Callout", () => {
  it("labels each variant", () => {
    expect(render("note")).toContain("Note");
    expect(render("tip")).toContain("Tip");
    expect(render("important")).toContain("Important");
    expect(render("warning")).toContain("Warning");
    expect(render("caution")).toContain("Caution");
  });

  it("prefers a custom title", () => {
    const html = renderToStaticMarkup(
      <Callout type="tip" title="Custom title">
        Body
      </Callout>,
    );

    expect(html).toContain("Custom title");
    expect(html).not.toContain(">Tip<");
  });

  it("falls back to note for invalid types", () => {
    const html = renderToStaticMarkup(<Callout type={"invalid" as any}>Body</Callout>);

    expect(html).toContain("Note");
    expect(html).toContain("<aside");
  });
});

describe("Blockquote", () => {
  it("renders every GitHub alert marker as a callout", () => {
    const alerts = [
      { marker: "NOTE", label: "Note" },
      { marker: "TIP", label: "Tip" },
      { marker: "IMPORTANT", label: "Important" },
      { marker: "WARNING", label: "Warning" },
      { marker: "CAUTION", label: "Caution" },
    ];

    for (const { marker, label } of alerts) {
      const html = renderBlockquote(<p>{`[!${marker}]\nBody`}</p>);

      expect(html).toContain("<aside");
      expect(html).toContain(label);
      expect(html).not.toContain(`[!${marker}]`);
    }
  });

  it("keeps content and inline formatting next to the marker", () => {
    const html = renderBlockquote(
      <p>
        {"[!NOTE]\nA "}
        <strong>useful</strong>
        {" note with "}
        <code>code</code>
        {" and a "}
        <a href="/docs">link</a>.
      </p>,
    );

    expect(html).toContain("<aside");
    expect(html).toContain("A <strong>useful</strong> note with <code>code</code>");
    expect(html).toContain('<a href="/docs">link</a>');
    expect(html).not.toContain("[!NOTE]");
  });

  it("keeps multiple paragraphs, lists, and code blocks", () => {
    const html = renderBlockquote([
      <p key="marker">[!WARNING]</p>,
      <p key="first">First paragraph.</p>,
      <p key="second">
        Second paragraph with <code>code</code>.
      </p>,
      <ul key="list">
        <li>One item</li>
      </ul>,
      <pre key="code">
        <code>vp test</code>
      </pre>,
    ]);

    expect(html).toContain("<aside");
    expect(html).toContain("<p>First paragraph.</p>");
    expect(html).toContain("<p>Second paragraph with <code>code</code>.</p>");
    expect(html).toContain("<ul><li>One item</li></ul>");
    expect(html).toContain("<pre><code>vp test</code></pre>");
    expect(html).not.toContain("[!WARNING]");
  });

  it("leaves normal blockquotes alone", () => {
    const html = renderBlockquote(<p>Good writing is mostly rewriting.</p>);

    expect(html).toBe("<blockquote><p>Good writing is mostly rewriting.</p></blockquote>");
    expect(html).not.toContain("<aside");
  });

  it("supports nested normal blockquotes", () => {
    const html = renderBlockquote([
      <p key="outer">A quote.</p>,
      <Blockquote key="inner">
        <p>A nested quote.</p>
      </Blockquote>,
    ]);

    expect(html).toContain(
      "<blockquote><p>A quote.</p><blockquote><p>A nested quote.</p></blockquote></blockquote>",
    );
  });

  it("filters empty paragraphs from GitHub alerts", () => {
    const html = renderBlockquote([
      <p key="marker">[!NOTE]</p>,
      <p key="empty1"></p>,
      <p key="whitespace"> </p>,
      <p key="content">Real content.</p>,
      <p key="empty2"></p>,
    ]);

    expect(html).toContain("<aside");
    expect(html).toContain("<p>Real content.</p>");
    expect(html.match(/<p><\/p>/g)).toBeNull();
  });
});
