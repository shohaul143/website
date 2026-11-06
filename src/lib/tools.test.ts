import { describe, expect, it } from "vite-plus/test";

import { getTool, toolPath, tools } from "./tools";

describe("tools registry", () => {
  it("finds every registered tool by slug", () => {
    for (const tool of tools) {
      expect(getTool(tool.slug)).toBe(tool);
    }

    expect(getTool("does-not-exist")).toBeUndefined();
  });

  it("builds encoded tool paths", () => {
    expect(toolPath("youtube thumbnail")).toBe("/tools/youtube%20thumbnail");
  });
});
