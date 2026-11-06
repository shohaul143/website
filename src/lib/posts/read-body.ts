/**
 * Read a response body while enforcing a hard byte limit.
 *
 * `Content-Length` is only a hint: a server can omit it or send a larger body.
 * Counting the bytes as they arrive keeps a bad download from filling memory.
 */
export async function readBodyWithLimit(
  body: ReadableStream<Uint8Array>,
  limit: number,
): Promise<Buffer> {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      size += value.byteLength;

      if (size > limit) {
        await reader.cancel().catch(() => {});
        throw new Error(`Body exceeds the ${limit} byte limit`);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks);
}
