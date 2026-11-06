import { describe, expect, it } from "vite-plus/test";
import { renderToStaticMarkup } from "react-dom/server";

import { Callout } from "./mdx-components";

function render(type: NonNullable<Parameters<typeof Callout>[0]["type"]>): string {
  return renderToStaticMarkup(<Callout type={type}>Body</Callout>);
}

describe("Callout", () => {
  it("labels each variant", () => {
    expect(render("note")).toContain("Note");
    expect(render("tip")).toContain("Tip");
    expect(render("warning")).toContain("Warning");
    expect(render("danger")).toContain("Danger");
  });

  it("resolves aliases to their canonical variant", () => {
    expect(render("info")).toContain("Note");
    expect(render("caution")).toContain("Warning");
    expect(render("error")).toContain("Danger");
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
});
