import { createBuilder } from "@content-collections/core";
import { describe, expect, it } from "vite-plus/test";

describe("content build", () => {
  it("builds all posts without crashing", async () => {
    const builder = await createBuilder("./content-collections.ts");
    let failed = false;

    builder.on("_error", () => {
      failed = true;
    });

    await builder.build();

    expect(failed).toBe(false);
  });
});
