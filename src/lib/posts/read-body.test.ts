import { describe, expect, it } from "vite-plus/test";

import { readBodyWithLimit } from "./read-body";

function streamOf(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
}

describe("readBodyWithLimit", () => {
  it("joins a body that stays under the limit", async () => {
    const bytes = await readBodyWithLimit(
      streamOf([new Uint8Array([1, 2]), new Uint8Array([3])]),
      10,
    );

    expect([...bytes]).toEqual([1, 2, 3]);
  });

  it("accepts a body exactly at the limit", async () => {
    const bytes = await readBodyWithLimit(streamOf([new Uint8Array(4), new Uint8Array(6)]), 10);

    expect(bytes.byteLength).toBe(10);
  });

  it("throws as soon as the body passes the limit", async () => {
    await expect(
      readBodyWithLimit(streamOf([new Uint8Array(8), new Uint8Array(8)]), 10),
    ).rejects.toThrow(/byte limit/);
  });
});
