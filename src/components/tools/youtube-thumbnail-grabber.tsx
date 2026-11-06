import {
  ArrowDownToLine,
  Check,
  Clipboard,
  Copy,
  ExternalLink,
  ImageIcon,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button, buttonVariants } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
  extractYouTubeVideoId,
  getThumbnailOptions,
  thumbnailSpecs,
  type ThumbnailOption,
  type ThumbnailQuality,
} from "#/lib/youtube";

const SAMPLE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

// YouTube serves a 120×90 placeholder when maxresdefault.jpg is missing.
const MISSING_MAX_RES_DIMENSIONS = { width: 120, height: 90 };

export function YouTubeThumbnailGrabber() {
  const [input, setInput] = useState("");
  const [selectedQuality, setSelectedQuality] = useState<ThumbnailQuality>("maxres");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [maxResMissingFor, setMaxResMissingFor] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const inputId = useId();
  const errorId = useId();

  const videoId = extractYouTubeVideoId(input);
  const hasInput = input.trim().length > 0;
  const isInvalid = hasInput && !videoId;
  const thumbnailOptions = videoId ? getThumbnailOptions(videoId) : [];
  const isMaxResMissing = videoId !== null && maxResMissingFor === videoId;
  const maxResOption = thumbnailOptions.find((option) => option.id === "maxres");
  const selectedOption = thumbnailOptions.find((option) => option.id === selectedQuality);
  const fallbackOption =
    thumbnailOptions.find((option) => option.id === "sd") ??
    thumbnailOptions.find((option) => option.id === "hq");
  const activeOption =
    selectedQuality === "maxres" && isMaxResMissing
      ? fallbackOption
      : (selectedOption ?? thumbnailOptions[0]);
  const imageCopyKey = activeOption ? `image-${activeOption.id}` : "";
  const urlCopyKey = activeOption ? `url-${activeOption.id}` : "";

  useEffect(() => {
    if (!copiedKey) {
      return;
    }

    const timeout = setTimeout(() => setCopiedKey(null), 2000);
    return () => clearTimeout(timeout);
  }, [copiedKey]);

  const copyText = async (url: string, key: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
    } catch {
      // Clipboard access can be denied; leave the button unchanged.
    }
  };

  const handleClear = () => setInput("");
  const handleSample = () => setInput(SAMPLE_URL);

  const handleDownload = async (option: ThumbnailOption) => {
    if (!videoId) return;
    setIsDownloading(true);
    const filename = `youtube-thumbnail-${videoId}-${option.filenameSuffix}.jpg`;

    try {
      const response = await fetch(option.url, { mode: "cors" });
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(option.url, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  const loadImageBlob = async (url: string): Promise<Blob> => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not get canvas context");
    context.drawImage(img, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not encode image"));
        }
      }, "image/png");
    });
  };

  const handleCopyImage = async (option: ThumbnailOption, key: string) => {
    try {
      const blob = await loadImageBlob(option.url);

      if (navigator.clipboard && "ClipboardItem" in window) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopiedKey(key);
          return;
        } catch {
          // ClipboardItem writes can fail; copy the URL instead.
        }
      }

      await copyText(option.url, key);
    } catch {
      await copyText(option.url, key);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="border bg-card p-5 sm:p-6">
        <label htmlFor={inputId} className="block text-sm font-medium">
          YouTube Video URL or ID
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          Supports full links, shorts, live streams, youtu.be, or direct 11-character video IDs.
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              id={inputId}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="h-10 pr-10 text-sm"
              aria-invalid={isInvalid}
              aria-describedby={isInvalid ? errorId : undefined}
              autoComplete="off"
              spellCheck={false}
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
              {hasInput ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleClear}
                  aria-label="Clear input"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </Button>
              ) : null}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleSample}
            className="h-10 shrink-0"
          >
            <Sparkles data-icon="inline-start" className="size-3.5" />
            Try sample
          </Button>
        </div>

        {isInvalid ? (
          <p id={errorId} role="alert" className="mt-2 text-xs text-destructive">
            Could not find a valid YouTube video ID. Please check the URL and try again.
          </p>
        ) : null}
      </section>

      {videoId && activeOption ? (
        <div className="flex flex-col gap-6">
          <section className="border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="text-base font-semibold tracking-tight">Thumbnail Preview</h3>
                <p className="text-xs text-muted-foreground">
                  Video ID: <code className="bg-muted px-1.5 py-0.5 font-mono">{videoId}</code>
                </p>
              </div>

              <div
                role="group"
                aria-label="Resolution selector"
                className="flex flex-wrap items-center gap-1.5"
              >
                {thumbnailOptions
                  .filter((option) => option.selectable)
                  .map((option) => {
                    const isSelected = selectedQuality === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedQuality(option.id)}
                        className={`border px-2.5 py-1 text-xs font-medium transition-colors ${
                          isSelected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        }`}
                      >
                        {option.shortLabel} ({option.dimensions.width}×{option.dimensions.height})
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center">
              <div className="relative w-full overflow-hidden border bg-muted/40">
                <img
                  key={activeOption.url}
                  src={activeOption.url}
                  alt={`YouTube thumbnail for video ${videoId} at ${activeOption.resolution}`}
                  className="mx-auto block max-h-[480px] w-full object-contain"
                  loading="eager"
                  onLoad={(event) => {
                    const img = event.currentTarget;
                    if (
                      selectedQuality === "maxres" &&
                      img.naturalWidth === MISSING_MAX_RES_DIMENSIONS.width &&
                      img.naturalHeight === MISSING_MAX_RES_DIMENSIONS.height
                    ) {
                      setMaxResMissingFor(videoId);
                    }
                  }}
                  onError={() => {
                    if (selectedQuality === "maxres") {
                      setMaxResMissingFor(videoId);
                    }
                  }}
                />
              </div>

              {isMaxResMissing && selectedQuality === "maxres" && maxResOption ? (
                <div className="mt-3 w-full border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  HD resolution ({maxResOption.dimensions.width}×{maxResOption.dimensions.height})
                  is not available for this video from YouTube. Displaying standard definition (
                  {activeOption.dimensions.width}×{activeOption.dimensions.height}) instead.
                </div>
              ) : null}

              <div className="mt-4 flex w-full flex-wrap items-center justify-between gap-3 border-t pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{activeOption.resolution}</span>
                  <span>•</span>
                  <span>{activeOption.aspectRatio} aspect ratio</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={isDownloading}
                    onClick={() => handleDownload(activeOption)}
                  >
                    <ArrowDownToLine data-icon="inline-start" className="size-3.5" />
                    Download Image
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyImage(activeOption, imageCopyKey)}
                  >
                    {copiedKey === imageCopyKey ? (
                      <>
                        <Check data-icon="inline-start" className="size-3.5 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy data-icon="inline-start" className="size-3.5" />
                        Copy Image
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyText(activeOption.url, urlCopyKey)}
                  >
                    {copiedKey === urlCopyKey ? (
                      <>
                        <Check data-icon="inline-start" className="size-3.5 text-emerald-500" />
                        Copied URL!
                      </>
                    ) : (
                      <>
                        <Clipboard data-icon="inline-start" className="size-3.5" />
                        Copy URL
                      </>
                    )}
                  </Button>

                  <a
                    href={activeOption.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open image in new tab"
                    className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section className="flex flex-col items-center justify-center border border-dashed bg-card/50 p-8 text-center sm:p-12">
          <div className="flex size-12 items-center justify-center border text-muted-foreground">
            <ImageIcon className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold tracking-tight">
            Paste a YouTube link above to start
          </h3>
          <p className="mt-1.5 max-w-sm text-balance text-xs text-muted-foreground">
            Download high-res video thumbnails for YouTube videos, shorts, live streams, and embed
            links.
          </p>

          <div className="mt-8 grid w-full max-w-lg gap-2 text-left text-xs text-muted-foreground sm:grid-cols-2">
            <div className="border bg-background p-3">
              <span className="font-medium text-foreground">Supported formats</span>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-[11px]">
                <li>youtube.com/watch?v=...</li>
                <li>youtu.be/...</li>
                <li>youtube.com/shorts/...</li>
                <li>youtube.com/live/...</li>
              </ul>
            </div>
            <div className="border bg-background p-3">
              <span className="font-medium text-foreground">Highest resolutions</span>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-[11px]">
                {thumbnailSpecs
                  .filter((option) => option.selectable)
                  .map((option) => (
                    <li key={option.id}>{option.resolution}</li>
                  ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
