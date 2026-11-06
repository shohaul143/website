import path from "node:path";

import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { MDXContent } from "@content-collections/mdx/react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import remarkGfm from "remark-gfm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { mdxComponents } from "./src/components/posts/mdx-components";
import { createCover } from "./src/lib/posts/images.server";
import { isInside, postsDirectory } from "./src/lib/posts/paths";
import { remarkPostImages } from "./src/lib/posts/remark-images";
import { postFrontmatterSchema } from "./src/lib/posts/schema";
import { slugFromPath } from "./src/lib/posts/utils";

const posts = defineCollection({
  name: "posts",
  directory: postsDirectory,
  include: "**/*.{md,mdx}",
  schema: postFrontmatterSchema,
  transform: async (document, context) => {
    const { content, _meta, coverImage, ...frontmatter } = document;
    const slug = slugFromPath(_meta.path);
    const sourceFilePath = path.resolve(context.collection.directory, _meta.filePath);

    if (!isInside(process.cwd(), sourceFilePath)) {
      throw new Error(`Post "${slug}" is outside the repository: ${sourceFilePath}`);
    }

    const sourcePath = path.relative(process.cwd(), sourceFilePath).replace(/\\/g, "/");

    const compiled = await compileMDX(
      context,
      { _meta, content },
      {
        remarkPlugins: [remarkGfm, [remarkPostImages, { sourcePath }]],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: { className: ["heading-anchor"] },
            },
          ],
          [
            rehypeShiki,
            {
              themes: { light: "github-light", dark: "github-dark" },
              defaultColor: false,
              fallbackLanguage: "text",
              langs: [
                "bash",
                "css",
                "diff",
                "html",
                "js",
                "json",
                "jsx",
                "md",
                "mdx",
                "sh",
                "text",
                "ts",
                "tsx",
                "yaml",
              ],
            },
          ],
        ],
      },
    );

    const html = renderToStaticMarkup(
      createElement(MDXContent, { code: compiled, components: mdxComponents }),
    );

    const cover = await createCover(coverImage, {
      title: frontmatter.title,
      tags: frontmatter.tags,
      publishedAt: frontmatter.publishedAt,
      slug,
      sourcePath,
    });

    return {
      ...frontmatter,
      slug,
      sourcePath,
      html,
      hasCustomCover: Boolean(coverImage),
      coverImage: cover.src,
      coverImageWidth: cover.width,
      coverImageHeight: cover.height,
      coverImageAlt: coverImage
        ? `Cover image for ${frontmatter.title}`
        : `${frontmatter.title} — article cover`,
    };
  },
  onSuccess: (documents) => {
    const seen = new Map<string, string>();

    for (const document of documents) {
      const existing = seen.get(document.slug);
      if (existing) {
        throw new Error(
          `Duplicate post slug "${document.slug}" in ${existing} and ${document.sourcePath}`,
        );
      }
      seen.set(document.slug, document.sourcePath);
    }
  },
});

export default defineConfig({
  content: [posts],
  cache: "memory",
});
