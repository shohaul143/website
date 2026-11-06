import { createHash, randomUUID } from "node:crypto";
import { lookup } from "node:dns/promises";
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { isIP } from "node:net";
import path from "node:path";
import { createElement } from "react";

import { Resvg } from "@resvg/resvg-js";
import satori, { type Font } from "satori";
import sharp from "sharp";

import { readBodyWithLimit } from "./read-body";
import { formatPostDate } from "./utils";
import {
  assertSafeRemoteImageUrl,
  isAllowedImageContentType,
  isAllowedImageFormat,
  isPrivateIpAddress,
} from "./image-safety";
import { isInside } from "./paths";
import { site } from "../site";

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");
const generatedImageDir = path.join(publicDir, "generated", "post-images");
const generatedCoverDir = path.join(publicDir, "generated", "social-covers");
const imageCacheDir = path.join(projectRoot, ".cache", "post-images", "remote");

const imageWidths = [480, 960, 1440];
const maxDownloadBytes = 15 * 1024 * 1024;
const fetchTimeoutMs = 20_000;
const maxRedirects = 3;
const socialCoverWidth = 1200;
const cacheMaxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days

const socialCoverHeight = 630;

export type ProcessedImage = {
  src: string;
  srcSetAvif: string;
  srcSetWebp: string;
  srcSetJpeg: string;
  width: number;
  height: number;
};

type GeneratedCover = {
  src: string;
  width: number;
  height: number;
};

function hash(value: string | Buffer, extra = ""): string {
  return createHash("sha256").update(value).update(extra).digest("hex").slice(0, 16);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function writeFileAtomic(filePath: string, data: string | Buffer): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(tempPath, data);
  try {
    await rename(tempPath, filePath);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
}

function isRemoteSource(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function resolveLocalSource(src: string, sourcePath: string): string {
  const clean = src.split(/[?#]/, 1)[0];

  if (!clean) {
    throw new Error("Image path is empty");
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    throw new Error(`Image path "${src}" is not valid URL encoding`);
  }

  if (decoded.startsWith("/")) {
    const filePath = path.join(publicDir, decoded.slice(1));

    if (!isInside(publicDir, filePath)) {
      throw new Error(`Image path "${src}" points outside public/`);
    }

    return filePath;
  }

  const filePath = path.resolve(path.dirname(path.resolve(projectRoot, sourcePath)), decoded);

  if (!isInside(projectRoot, filePath)) {
    throw new Error(`Image path "${src}" points outside the repository`);
  }

  return filePath;
}

async function assertPublicHost(url: URL): Promise<void> {
  const hostname = url.hostname.replace(/^\[|\]$/g, "");

  if (isIP(hostname)) {
    if (isPrivateIpAddress(hostname)) {
      throw new Error(`Remote image host "${hostname}" resolves to a private address`);
    }
    return;
  }

  let addresses: Array<{ address: string }>;
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch (error) {
    throw new Error(
      `Could not resolve remote image host "${hostname}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (addresses.length === 0) {
    throw new Error(`Remote image host "${hostname}" did not resolve`);
  }

  for (const { address } of addresses) {
    if (isPrivateIpAddress(address)) {
      throw new Error(`Remote image host "${hostname}" resolves to a private address`);
    }
  }
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

async function fetchRemoteResponse(
  sourceUrl: string,
  headers: Record<string, string>,
): Promise<Response> {
  let current = new URL(sourceUrl);

  for (let redirects = 0; redirects <= maxRedirects; redirects += 1) {
    assertSafeRemoteImageUrl(current);
    await assertPublicHost(current);

    const response = await fetch(current, {
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });

    if (REDIRECT_STATUSES.has(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error("Redirect response is missing a Location header");
      }
      current = new URL(location, current);
      continue;
    }

    return response;
  }

  throw new Error("Too many redirects");
}

async function readCachedRemote(
  cachePath: string,
  metadataPath: string,
): Promise<{ bytes: Buffer; etag?: string; lastModified?: string } | undefined> {
  try {
    const [bytes, rawMetadata] = await Promise.all([
      readFile(cachePath),
      readFile(metadataPath, "utf8"),
    ]);
    const metadata = JSON.parse(rawMetadata) as { etag?: string; lastModified?: string };
    return { bytes, etag: metadata.etag, lastModified: metadata.lastModified };
  } catch {
    return undefined;
  }
}

async function fetchRemoteImage(sourceUrl: string, sourcePath: string): Promise<Buffer> {
  const key = hash(sourceUrl);
  const cachePath = path.join(imageCacheDir, `${key}.bin`);
  const metadataPath = path.join(imageCacheDir, `${key}.json`);
  const cached = await readCachedRemote(cachePath, metadataPath);

  const headers: Record<string, string> = {
    accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8",
  };

  if (cached?.etag) {
    headers["if-none-match"] = cached.etag;
  }
  if (cached?.lastModified) {
    headers["if-modified-since"] = cached.lastModified;
  }

  try {
    const response = await fetchRemoteResponse(sourceUrl, headers);

    if (response.status === 304 && cached) {
      return cached.bytes;
    }

    if (!response.ok) {
      throw new Error(`Image request failed with status ${response.status}`);
    }

    if (!isAllowedImageContentType(response.headers.get("content-type"))) {
      throw new Error(
        `Unsupported image content type "${response.headers.get("content-type") ?? "unknown"}"`,
      );
    }

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > maxDownloadBytes) {
      throw new Error(`Image is larger than ${maxDownloadBytes} bytes`);
    }

    if (!response.body) {
      throw new Error("Image response has no body");
    }

    const bytes = await readBodyWithLimit(response.body, maxDownloadBytes);

    await writeFileAtomic(cachePath, bytes);
    await writeFileAtomic(
      metadataPath,
      JSON.stringify(
        {
          etag: response.headers.get("etag") ?? undefined,
          lastModified: response.headers.get("last-modified") ?? undefined,
        },
        null,
        2,
      ),
    );

    return bytes;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Use cache only for network errors (timeout, DNS, connection), not HTTP errors (404, 403).
    const isHttpError = errorMessage.includes("request failed with status");

    if (cached && !isHttpError) {
      console.warn(`[posts] Using cached copy of ${sourceUrl} for ${sourcePath}: ${errorMessage}`);
      return cached.bytes;
    }

    throw new Error(`Failed to download image "${sourceUrl}" for ${sourcePath}: ${errorMessage}`);
  }
}

/**
 * Remove cached remote images older than 30 days. Runs once per build to keep
 * the cache from growing without limit.
 */
export async function cleanOldCacheEntries(): Promise<void> {
  try {
    const entries = await readdir(imageCacheDir);
    const now = Date.now();
    let removed = 0;

    for (const entry of entries) {
      const filePath = path.join(imageCacheDir, entry);
      const stats = await stat(filePath).catch(() => undefined);

      if (stats && now - stats.mtimeMs > cacheMaxAgeMs) {
        await rm(filePath, { force: true });
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[posts] Removed ${removed} old cache entries`);
    }
  } catch (error) {
    // Cache directory doesn't exist yet or cleanup failed; not fatal.
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(
        `[posts] Cache cleanup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

async function loadImageSource(src: string, sourcePath: string): Promise<Buffer> {
  if (isRemoteSource(src)) {
    return fetchRemoteImage(src, sourcePath);
  }

  const filePath = resolveLocalSource(src, sourcePath);
  try {
    return await readFile(filePath);
  } catch (error) {
    throw new Error(
      `Could not read image "${src}" for ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function processPostImage(src: string, sourcePath: string): Promise<ProcessedImage> {
  const bytes = await loadImageSource(src, sourcePath);
  const metadata = await sharp(bytes).metadata();

  if (!metadata.width || !metadata.height || !isAllowedImageFormat(metadata.format)) {
    throw new Error(`Unsupported or invalid image "${src}" for ${sourcePath}`);
  }

  const swapped = (metadata.orientation ?? 1) >= 5 && (metadata.orientation ?? 1) <= 8;
  const sourceWidth = swapped ? metadata.height : metadata.width;
  const sourceHeight = swapped ? metadata.width : metadata.height;
  const widths = imageWidths.filter((width) => width <= sourceWidth);
  const targetWidths = widths.length > 0 ? widths : [sourceWidth];
  const animated =
    (metadata.pages ?? 1) > 1 && (metadata.format === "gif" || metadata.format === "webp");
  const outputKey = hash(bytes, JSON.stringify({ widths: targetWidths, version: 2 }));
  const outputDir = path.join(generatedImageDir, outputKey);

  await mkdir(outputDir, { recursive: true });

  for (const width of targetWidths) {
    const avifPath = path.join(outputDir, `${width}.avif`);
    const webpPath = path.join(outputDir, `${width}.webp`);
    const jpegPath = path.join(outputDir, `${width}.jpg`);

    if (
      animated
        ? await fileExists(webpPath)
        : (await fileExists(avifPath)) &&
          (await fileExists(webpPath)) &&
          (await fileExists(jpegPath))
    ) {
      continue;
    }

    const input = animated ? { animated: true } : undefined;
    const { data } = await sharp(bytes, input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true });

    const writes = [sharp(data, input).webp({ quality: 78 }).toFile(webpPath)];

    if (!animated) {
      writes.push(
        sharp(data).avif({ quality: 55 }).toFile(avifPath),
        sharp(data).jpeg({ quality: 82, mozjpeg: true }).toFile(jpegPath),
      );
    }

    await Promise.all(writes);
  }

  const largestWidth = targetWidths[targetWidths.length - 1];
  const largestHeight = Math.round((sourceHeight * largestWidth) / sourceWidth);
  const urlFor = (width: number, extension: string) =>
    `/generated/post-images/${outputKey}/${width}.${extension}`;

  if (animated) {
    const extension = metadata.format === "gif" ? "gif" : "webp";
    const fallbackName = `original.${extension}`;
    const fallbackPath = path.join(outputDir, fallbackName);

    if (!(await fileExists(fallbackPath))) {
      await writeFileAtomic(fallbackPath, bytes);
    }

    return {
      src: `/generated/post-images/${outputKey}/${fallbackName}`,
      srcSetAvif: "",
      srcSetWebp: targetWidths.map((width) => `${urlFor(width, "webp")} ${width}w`).join(", "),
      srcSetJpeg: "",
      width: sourceWidth,
      height: sourceHeight,
    };
  }

  return {
    src: urlFor(largestWidth, "jpg"),
    srcSetAvif: targetWidths.map((width) => `${urlFor(width, "avif")} ${width}w`).join(", "),
    srcSetWebp: targetWidths.map((width) => `${urlFor(width, "webp")} ${width}w`).join(", "),
    srcSetJpeg: targetWidths.map((width) => `${urlFor(width, "jpg")} ${width}w`).join(", "),
    width: largestWidth,
    height: largestHeight,
  };
}

async function processCoverImage(src: string, sourcePath: string): Promise<GeneratedCover> {
  const bytes = await loadImageSource(src, sourcePath);
  const outputKey = hash(
    bytes,
    JSON.stringify({ version: 2, width: socialCoverWidth, height: socialCoverHeight }),
  );
  const outputPath = path.join(generatedCoverDir, `${outputKey}.jpg`);
  const publicUrl = `/generated/social-covers/${outputKey}.jpg`;

  if (!(await fileExists(outputPath))) {
    const data = await sharp(bytes)
      .rotate()
      .resize(socialCoverWidth, socialCoverHeight, { fit: "cover", position: "attention" })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();

    await writeFileAtomic(outputPath, data);
  }

  return { src: publicUrl, width: socialCoverWidth, height: socialCoverHeight };
}

let cardFonts: Promise<Font[]> | undefined;

function loadCardFonts(): Promise<Font[]> {
  cardFonts ??= Promise.all([
    readFile(
      path.join(projectRoot, "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2"),
    ),
    readFile(
      path.join(projectRoot, "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2"),
    ),
    readFile(
      path.join(
        projectRoot,
        "node_modules/@fontsource-variable/caveat/files/caveat-latin-wght-normal.woff2",
      ),
    ),
  ]).then(([regular, bold, signature]) => [
    { name: "Inter", data: regular, weight: 400, style: "normal" },
    { name: "Inter", data: bold, weight: 700, style: "normal" },
    { name: "Caveat", data: signature, weight: 400, style: "normal" },
  ]);

  return cardFonts;
}

function createTagPill(tag: string) {
  return createElement(
    "span",
    {
      key: tag,
      style: {
        border: "1px solid #333333",
        padding: "8px 14px",
        fontSize: "16px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#d4d4d4",
      },
    },
    tag,
  );
}

async function generateSocialCover(input: {
  title: string;
  tags: string[];
  publishedAt: string;
  slug: string;
}): Promise<GeneratedCover> {
  const outputKey = hash(
    JSON.stringify({
      title: input.title,
      tags: input.tags,
      publishedAt: input.publishedAt,
      slug: input.slug,
      siteName: site.name,
      siteUrl: site.url,
      width: socialCoverWidth,
      height: socialCoverHeight,
      version: 3,
    }),
  );
  const outputPath = path.join(generatedCoverDir, `${outputKey}.png`);
  const publicUrl = `/generated/social-covers/${outputKey}.png`;

  if (await fileExists(outputPath)) {
    return { src: publicUrl, width: socialCoverWidth, height: socialCoverHeight };
  }

  const fonts = await loadCardFonts();
  const titleSize = input.title.length > 90 ? "52px" : "64px";
  const tags = input.tags.slice(0, 3);

  const card = createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#0a0a0a",
        color: "#fafafa",
        padding: "64px",
        border: "2px solid #262626",
        boxSizing: "border-box",
        fontFamily: "Inter",
      },
    },
    createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        },
      },
      createElement(
        "div",
        { style: { display: "flex", alignItems: "baseline", gap: "20px" } },
        createElement(
          "span",
          {
            style: {
              fontFamily: "Caveat",
              fontSize: "76px",
              lineHeight: 1,
              color: "#fafafa",
            },
          },
          "sh",
        ),
        createElement(
          "span",
          {
            style: {
              fontSize: "18px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#a1a1a1",
            },
          },
          site.name,
        ),
      ),
      createElement(
        "span",
        { style: { fontSize: "22px", color: "#a1a1a1" } },
        formatPostDate(input.publishedAt),
      ),
    ),
    createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1000px" } },
      createElement(
        "span",
        {
          style: {
            fontSize: "18px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#737373",
          },
        },
        "Writing",
      ),
      createElement(
        "span",
        {
          style: {
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "#fafafa",
            lineClamp: 3,
            textOverflow: "ellipsis",
            overflow: "hidden",
          },
        },
        input.title,
      ),
    ),
    createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          gap: "24px",
        },
      },
      createElement(
        "div",
        { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
        ...(tags.length > 0 ? tags.map(createTagPill) : [createTagPill("Writing")]),
      ),
      createElement(
        "span",
        { style: { fontSize: "18px", color: "#737373" } },
        site.url.replace(/^https?:\/\//, ""),
      ),
    ),
  );

  const svg = await satori(card, {
    width: socialCoverWidth,
    height: socialCoverHeight,
    fonts,
  });
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: socialCoverWidth },
  })
    .render()
    .asPng();

  await writeFileAtomic(outputPath, png);

  return { src: publicUrl, width: socialCoverWidth, height: socialCoverHeight };
}

export async function createCover(
  coverImage: string | undefined,
  input: { title: string; tags: string[]; publishedAt: string; slug: string; sourcePath: string },
): Promise<GeneratedCover> {
  return coverImage ? processCoverImage(coverImage, input.sourcePath) : generateSocialCover(input);
}
