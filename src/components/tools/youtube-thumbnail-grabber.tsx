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
import { useId, useMemo, useState } from "react";

import { Button, buttonVariants } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
  extractYouTubeVideoId,
  getThumbnailOptions,
  type ThumbnailOption,
  type ThumbnailQuality,
} from "#/lib/youtube";
const SAMPLE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

export function YouTubeThumbnailGrabber() {
  const [input, setInput] = useState("");
  const [selectedQuality, setSelectedQuality] = useState<ThumbnailQuality>("maxres");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isMaxResMissing, setIsMaxResMissing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const inputId = useId();

  const videoId = useMemo(() => extractYouTubeVideoId(input), [input]);
  const hasInput = input.trim().length > 0;
  const isInvalid = hasInput && !videoId;

  const thumbnailOptions = useMemo(() => {
    if (!videoId) return [];
    return getThumbnailOptions(videoId);
  }, [videoId]);

  const activeOption: ThumbnailOption | undefined = useMemo(() => {
    if (!thumbnailOptions.length) return undefined;
    if (selectedQuality === "maxres" && isMaxResMissing) {
      return (
        thumbnailOptions.find((opt) => opt.id === "sd") ??
        thumbnailOptions.find((opt) => opt.id === "hq")
      );
    }
    return thumbnailOptions.find((opt) => opt.id === selectedQuality) ?? thumbnailOptions[0];
  }, [thumbnailOptions, selectedQuality, isMaxResMissing]);

  const setTemporaryCopied = (key: string) => {
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const handleClear = () => {
    setInput("");
    setIsMaxResMissing(false);
  };

  const handleSample = () => {
    setInput(SAMPLE_URL);
    setIsMaxResMissing(false);
  };

  const handleCopyUrl = async (url: string, key: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setTemporaryCopied(key);
    } catch {
      // Fallback
    }
  };

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
      // Fallback: open in new tab
      window.open(option.url, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyImage = async (option: ThumbnailOption, key: string) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = option.url;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && "ClipboardItem" in window) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            setTemporaryCopied(key);
            return;
          } catch {
            // ClipboardItem write failed
          }
        }
        // Fallback to URL copy
        await navigator.clipboard.writeText(option.url);
        setTemporaryCopied(key);
      }, "image/png");
    } catch {
      // Fallback to URL copy
      await navigator.clipboard.writeText(option.url);
      setTemporaryCopied(key);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Input section */}
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
              onChange={(e) => {
                setInput(e.target.value);
                setIsMaxResMissing(false);
              }}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="h-10 pr-10 text-sm"
              aria-invalid={isInvalid}
              autoComplete="off"
              spellCheck={false}
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
              {hasInput && (
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
              )}
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

        {isInvalid && (
          <p className="mt-2 text-xs text-destructive">
            Could not find a valid YouTube video ID. Please check the URL and try again.
          </p>
        )}
      </section>

      {/* Main Preview & Actions */}
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

              {/* Quality selector tabs */}
              <div
                role="group"
                aria-label="Resolution selector"
                className="flex flex-wrap items-center gap-1.5"
              >
                {thumbnailOptions
                  .filter((opt) => opt.id !== "default")
                  .map((option) => {
                    const isSelected = selectedQuality === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedQuality(option.id)}
                        className={`border px-2.5 py-1 text-xs font-medium transition-colors ${
                          isSelected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        }`}
                      >
                        {option.label.split(" ")[0]} ({option.dimensions.width}×
                        {option.dimensions.height})
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Thumbnail Display */}
            <div className="mt-4 flex flex-col items-center">
              <div className="relative w-full overflow-hidden border bg-muted/40">
                <img
                  key={activeOption.url}
                  src={activeOption.url}
                  alt={`YouTube thumbnail for video ${videoId} at ${activeOption.resolution}`}
                  className="mx-auto block max-h-[480px] w-full object-contain"
                  loading="eager"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    // YouTube returns a 120x90 image if maxresdefault doesn't exist
                    if (
                      selectedQuality === "maxres" &&
                      img.naturalWidth === 120 &&
                      img.naturalHeight === 90
                    ) {
                      setIsMaxResMissing(true);
                    }
                  }}
                  onError={() => {
                    if (selectedQuality === "maxres") {
                      setIsMaxResMissing(true);
                    }
                  }}
                />
              </div>

              {isMaxResMissing && selectedQuality === "maxres" && (
                <div className="mt-3 w-full border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  HD resolution (1280×720) is not available for this video from YouTube. Displaying
                  standard definition ({activeOption.dimensions.width}×
                  {activeOption.dimensions.height}) instead.
                </div>
              )}

              {/* Action Toolbar */}
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
                    onClick={() => handleCopyImage(activeOption, `main-img-${activeOption.id}`)}
                  >
                    {copiedKey === `main-img-${activeOption.id}` ? (
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
                    onClick={() => handleCopyUrl(activeOption.url, `main-url-${activeOption.id}`)}
                  >
                    {copiedKey === `main-url-${activeOption.id}` ? (
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
        /* Empty State / How to use */
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
                <li>HD 1280 × 720 (maxres)</li>
                <li>SD 640 × 480</li>
                <li>HQ 480 × 360</li>
                <li>MQ 320 × 180</li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
