import { readdirSync } from "node:fs";
import path from "node:path";

import { cleanOldCacheEntries } from "../src/lib/posts/images.server";
import { postsDirectory } from "../src/lib/posts/paths";
import { slugFromPath } from "../src/lib/posts/utils";

import { createBuilder } from "@content-collections/core";

function checkForDuplicateSlugs(): void {
  const files = readdirSync(postsDirectory, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.(md|mdx)$/i.test(file))
    .map((file) => file.toString());

  const seen = new Map<string, string>();

  for (const file of files) {
    try {
      const slug = slugFromPath(file);
      const existing = seen.get(slug);

      if (existing) {
        console.error(
          `Duplicate post slug "${slug}" in ${postsDirectory}/${existing} and ${postsDirectory}/${file}`,
        );
        process.exitCode = 1;
        return;
      }

      seen.set(slug, file);
    } catch {
      // slugFromPath will throw for invalid paths; the builder will report those.
    }
  }
}

async function main() {
  checkForDuplicateSlugs();

  if (process.exitCode === 1) {
    return;
  }

  await cleanOldCacheEntries();

  const builder = await createBuilder("./content-collections.ts");
  let failed = false;
  let reportedDetail = false;

  const fail = (message: string) => {
    failed = true;
    reportedDetail = true;
    console.error(message);
  };

  builder.on("collector:read-error", ({ filePath, error }) => {
    fail(`Could not read ${filePath}: ${error.message}`);
  });
  builder.on("collector:parse-error", ({ filePath, error }) => {
    fail(`Could not parse ${filePath}: ${error.message}`);
  });
  builder.on("transformer:validation-error", ({ collection, file, error }) => {
    const filePath =
      "directory" in collection ? path.join(collection.directory, file.path) : file.path;

    fail(`Validation failed on ${filePath}:\n${error.message}`);
  });
  builder.on("transformer:error", ({ collection, error }) => {
    fail(`Transform failed in "${collection.name}": ${error.message}`);
  });
  builder.on("transformer:result-error", ({ collection, error }) => {
    fail(`Invalid result in "${collection.name}": ${error.message}`);
  });
  // `_error` repeats the detailed events above; print it only when none fired.
  builder.on("_error", ({ error }) => {
    failed = true;

    if (!reportedDetail) {
      console.error(error.message);
    }
  });

  await builder.build();

  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
