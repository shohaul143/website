import { describe, expect, it } from "vite-plus/test";

import { extractYouTubeVideoId, getThumbnailOptions } from "./youtube";

describe("extractYouTubeVideoId", () => {
  it("extracts from standard watch URLs", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
    expect(extractYouTubeVideoId("http://youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(
      extractYouTubeVideoId("https://www.youtube.com/watch?feature=shared&v=dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("extracts from youtu.be short URLs", () => {
    expect(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?si=abcdef1234")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeVideoId("youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts from shorts, embed, live, and music URLs", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeVideoId("https://www.youtube.com/live/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeVideoId("https://music.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("accepts a direct 11-character video ID", () => {
    expect(extractYouTubeVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeVideoId("  dQw4w9WgXcQ  ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null on invalid inputs", () => {
    expect(extractYouTubeVideoId("")).toBeNull();
    expect(extractYouTubeVideoId("   ")).toBeNull();
    expect(extractYouTubeVideoId("https://google.com")).toBeNull();
    expect(extractYouTubeVideoId("not-a-valid-id")).toBeNull();
  });
});

describe("getThumbnailOptions", () => {
  it("builds one option per quality with derived metadata", () => {
    const options = getThumbnailOptions("dQw4w9WgXcQ");

    expect(options.map((option) => option.id)).toEqual(["maxres", "sd", "hq", "mq"]);
    expect(options.map((option) => option.url)).toEqual([
      "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      "https://img.youtube.com/vi/dQw4w9WgXcQ/sddefault.jpg",
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    ]);
    expect(options.map((option) => option.aspectRatio)).toEqual(["16:9", "4:3", "4:3", "16:9"]);
    expect(options[0]?.filenameSuffix).toBe("maxres-1280x720");
  });
});
