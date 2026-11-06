export type ThumbnailQuality = "maxres" | "sd" | "hq" | "mq";

export type ThumbnailOption = {
  id: ThumbnailQuality;
  label: string;
  shortLabel: string;
  resolution: string;
  dimensions: { width: number; height: number };
  selectable: boolean;
  url: string;
  aspectRatio: "16:9" | "4:3";
  filenameSuffix: string;
};

export const thumbnailSpecs: ReadonlyArray<
  Omit<ThumbnailOption, "url" | "aspectRatio" | "filenameSuffix">
> = [
  {
    id: "maxres",
    label: "Maximum Resolution",
    shortLabel: "Maximum",
    resolution: "1280 × 720 (HD)",
    dimensions: { width: 1280, height: 720 },
    selectable: true,
  },
  {
    id: "sd",
    label: "Standard Definition",
    shortLabel: "Standard",
    resolution: "640 × 480 (SD)",
    dimensions: { width: 640, height: 480 },
    selectable: true,
  },
  {
    id: "hq",
    label: "High Quality",
    shortLabel: "High",
    resolution: "480 × 360",
    dimensions: { width: 480, height: 360 },
    selectable: true,
  },
  {
    id: "mq",
    label: "Medium Quality",
    shortLabel: "Medium",
    resolution: "320 × 180",
    dimensions: { width: 320, height: 180 },
    selectable: true,
  },
];

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function asVideoId(value: string | null | undefined): string | null {
  return value && VIDEO_ID_PATTERN.test(value) ? value : null;
}

function toUrl(input: string): URL | null {
  const candidate = input.match(/https?:\/\/[^\s]+/i)?.[0] ?? input;

  try {
    return new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
  } catch {
    return null;
  }
}

function getAspectRatio(dimensions: { width: number; height: number }): "16:9" | "4:3" {
  return dimensions.width * 9 === dimensions.height * 16 ? "16:9" : "4:3";
}

export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const direct = asVideoId(trimmed);
  if (direct) return direct;

  const url = toUrl(trimmed);
  if (!url) return null;

  const host = url.hostname.replace(/^(?:www\.|m\.)+/, "").toLowerCase();

  if (host === "youtu.be") {
    return asVideoId(url.pathname.split("/").filter(Boolean)[0]);
  }

  if (host === "youtube.com" || host === "music.youtube.com") {
    const fromQuery = asVideoId(url.searchParams.get("v"));
    if (fromQuery) return fromQuery;

    const parts = url.pathname.split("/").filter(Boolean);
    const prefixIndex = parts.findIndex((part) =>
      ["embed", "shorts", "live", "v"].includes(part.toLowerCase()),
    );

    return prefixIndex === -1 ? null : asVideoId(parts[prefixIndex + 1]);
  }

  return null;
}

export function getThumbnailOptions(videoId: string): ThumbnailOption[] {
  const baseUrl = `https://img.youtube.com/vi/${videoId}`;

  return thumbnailSpecs.map((spec) => ({
    ...spec,
    url: `${baseUrl}/${spec.id}default.jpg`,
    aspectRatio: getAspectRatio(spec.dimensions),
    filenameSuffix: `${spec.id}-${spec.dimensions.width}x${spec.dimensions.height}`,
  }));
}
