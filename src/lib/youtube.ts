export type ThumbnailQuality = "maxres" | "sd" | "hq" | "mq" | "default";

export type ThumbnailOption = {
  id: ThumbnailQuality;
  label: string;
  resolution: string;
  dimensions: { width: number; height: number };
  aspectRatio: "16:9" | "4:3";
  filenameSuffix: string;
  url: string;
};

/**
 * Extracts an 11-character YouTube video ID from various URL formats or raw ID.
 */
export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Direct 11-character ID (consisting of alphanumeric, hyphens, and underscores)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const urlString = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(urlString);
    const host = url.hostname.replace(/^(?:www\.|m\.)/, "").toLowerCase();

    // youtu.be/<id>
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0]?.split("?")[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // youtube.com or music.youtube.com
    if (host === "youtube.com" || host === "music.youtube.com") {
      // /watch?v=<id>
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      // /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
      const parts = url.pathname.split("/").filter(Boolean);
      const prefixIndex = parts.findIndex((p) =>
        ["embed", "shorts", "live", "v"].includes(p.toLowerCase()),
      );
      if (prefixIndex !== -1 && parts[prefixIndex + 1]) {
        const id = parts[prefixIndex + 1];
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
    }
  } catch {
    // If URL parsing fails, fall through to regex
  }

  // Broad regex fallback
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i,
  );
  if (match?.[1]) {
    return match[1];
  }

  return null;
}

export function getThumbnailOptions(videoId: string): Array<ThumbnailOption> {
  const baseUrl = `https://img.youtube.com/vi/${videoId}`;

  return [
    {
      id: "maxres",
      label: "Maximum Resolution",
      resolution: "1280 × 720 (HD)",
      dimensions: { width: 1280, height: 720 },
      aspectRatio: "16:9",
      filenameSuffix: "maxres-1280x720",
      url: `${baseUrl}/maxresdefault.jpg`,
    },
    {
      id: "sd",
      label: "Standard Definition",
      resolution: "640 × 480 (SD)",
      dimensions: { width: 640, height: 480 },
      aspectRatio: "4:3",
      filenameSuffix: "sd-640x480",
      url: `${baseUrl}/sddefault.jpg`,
    },
    {
      id: "hq",
      label: "High Quality",
      resolution: "480 × 360",
      dimensions: { width: 480, height: 360 },
      aspectRatio: "4:3",
      filenameSuffix: "hq-480x360",
      url: `${baseUrl}/hqdefault.jpg`,
    },
    {
      id: "mq",
      label: "Medium Quality",
      resolution: "320 × 180",
      dimensions: { width: 320, height: 180 },
      aspectRatio: "16:9",
      filenameSuffix: "mq-320x180",
      url: `${baseUrl}/mqdefault.jpg`,
    },
    {
      id: "default",
      label: "Default Small",
      resolution: "120 × 90",
      dimensions: { width: 120, height: 90 },
      aspectRatio: "4:3",
      filenameSuffix: "default-120x90",
      url: `${baseUrl}/default.jpg`,
    },
  ];
}
