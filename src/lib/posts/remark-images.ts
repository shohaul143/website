import { processPostImage, type ProcessedImage } from "./images.server";

type MdAttribute = {
  type: string;
  name?: string;
  value?: unknown;
};

type MdNode = {
  type: string;
  children?: MdNode[];
  url?: string;
  alt?: string | null;
  title?: string | null;
  name?: string | null;
  attributes?: MdAttribute[];
};

type ImageNode = MdNode & { type: "image"; url: string };
type MdxImageElement = MdNode & { name: "img" | "PostImage"; attributes: MdAttribute[] };

type RemarkPostImagesOptions = {
  sourcePath: string;
};

type PostImageOptions = {
  alt?: string | null;
  title?: string | null;
  caption?: string;
  className?: string;
  inline?: boolean;
  priority?: boolean;
};

function isImageNode(node: MdNode): node is ImageNode {
  return node.type === "image" && typeof node.url === "string";
}

function isMdxImageElement(node: MdNode): node is MdxImageElement {
  return (
    (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
    (node.name === "img" || node.name === "PostImage") &&
    Array.isArray(node.attributes)
  );
}

function isLoneImageParagraph(node: MdNode): node is MdNode & { children: [ImageNode] } {
  return node.type === "paragraph" && node.children?.length === 1 && isImageNode(node.children[0]);
}

function findAttribute(node: MdNode, name: string): MdAttribute | undefined {
  return node.attributes?.find(
    (candidate) => candidate.type === "mdxJsxAttribute" && candidate.name === name,
  );
}

function getStringAttribute(node: MdNode, name: string): string | undefined {
  const value = findAttribute(node, name)?.value;

  return typeof value === "string" ? value : undefined;
}

function getBooleanAttribute(node: MdNode, name: string): boolean {
  const attribute = findAttribute(node, name);

  if (!attribute) {
    return false;
  }

  return (
    attribute.value === undefined ||
    attribute.value === null ||
    attribute.value === true ||
    attribute.value === "true"
  );
}

function postImageAttributes(image: ProcessedImage, options: PostImageOptions): MdAttribute[] {
  const attributes: MdAttribute[] = [
    { type: "mdxJsxAttribute", name: "src", value: image.src },
    { type: "mdxJsxAttribute", name: "srcSetAvif", value: image.srcSetAvif },
    { type: "mdxJsxAttribute", name: "srcSetWebp", value: image.srcSetWebp },
    { type: "mdxJsxAttribute", name: "srcSetJpeg", value: image.srcSetJpeg },
    { type: "mdxJsxAttribute", name: "width", value: String(image.width) },
    { type: "mdxJsxAttribute", name: "height", value: String(image.height) },
    { type: "mdxJsxAttribute", name: "alt", value: options.alt ?? "" },
  ];

  if (options.title) {
    attributes.push({ type: "mdxJsxAttribute", name: "title", value: options.title });
  }
  if (options.caption) {
    attributes.push({ type: "mdxJsxAttribute", name: "caption", value: options.caption });
  }
  if (options.className) {
    attributes.push({ type: "mdxJsxAttribute", name: "className", value: options.className });
  }
  if (options.inline) {
    attributes.push({ type: "mdxJsxAttribute", name: "inline", value: "true" });
  }
  if (options.priority) {
    attributes.push({ type: "mdxJsxAttribute", name: "priority", value: "true" });
  }

  return attributes;
}

function createPostImageElement(
  image: ProcessedImage,
  options: Pick<PostImageOptions, "alt" | "title" | "inline">,
): MdNode {
  return {
    type: options.inline ? "mdxJsxTextElement" : "mdxJsxFlowElement",
    name: "PostImage",
    attributes: postImageAttributes(image, options),
    children: [],
  };
}

async function processMdxImageElement(node: MdxImageElement, sourcePath: string): Promise<void> {
  const src = getStringAttribute(node, "src");
  if (!src) {
    throw new Error(
      `Image element in ${sourcePath} must have a string "src" attribute so it can be optimized at build time.`,
    );
  }

  const image = await processPostImage(src, sourcePath);

  node.name = "PostImage";
  node.attributes = postImageAttributes(image, {
    alt: getStringAttribute(node, "alt") ?? "",
    title: getStringAttribute(node, "title"),
    caption: getStringAttribute(node, "caption"),
    className: getStringAttribute(node, "className"),
    inline: node.type === "mdxJsxTextElement",
    priority: getBooleanAttribute(node, "priority"),
  });
}

async function walk(node: MdNode, sourcePath: string): Promise<void> {
  if (!node.children) {
    return;
  }

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (isLoneImageParagraph(child)) {
      const imageNode = child.children[0];
      const image = await processPostImage(imageNode.url, sourcePath);
      node.children[index] = createPostImageElement(image, {
        alt: imageNode.alt,
        title: imageNode.title,
        inline: false,
      });
      continue;
    }

    if (isImageNode(child)) {
      const image = await processPostImage(child.url, sourcePath);
      node.children[index] = createPostImageElement(image, {
        alt: child.alt,
        title: child.title,
        inline: true,
      });
      continue;
    }

    if (isMdxImageElement(child)) {
      await processMdxImageElement(child, sourcePath);
    }

    await walk(child, sourcePath);
  }
}

/**
 * Rewrite every Markdown/MDX image to a shared `<PostImage>` element backed by
 * build-time optimized AVIF/WebP/JPEG variants.
 */
export function remarkPostImages(options: RemarkPostImagesOptions) {
  return async (tree: MdNode): Promise<void> => {
    await walk(tree, options.sourcePath);
  };
}
