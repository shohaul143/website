import { describe, expect, it } from "vite-plus/test";

import {
  assertSafeRemoteImageUrl,
  isAllowedImageContentType,
  isAllowedImageFormat,
  isPrivateIpAddress,
} from "./image-safety";

describe("isPrivateIpAddress", () => {
  it("detects private IPv4 ranges", () => {
    expect(isPrivateIpAddress("127.0.0.1")).toBe(true);
    expect(isPrivateIpAddress("10.0.0.1")).toBe(true);
    expect(isPrivateIpAddress("172.16.0.1")).toBe(true);
    expect(isPrivateIpAddress("192.168.1.1")).toBe(true);
    expect(isPrivateIpAddress("169.254.169.254")).toBe(true);
  });

  it("detects private IPv6 ranges", () => {
    expect(isPrivateIpAddress("::1")).toBe(true);
    expect(isPrivateIpAddress("fd00::1")).toBe(true);
    expect(isPrivateIpAddress("fe80::1")).toBe(true);
  });

  it("normalizes IPv4-mapped IPv6 addresses", () => {
    expect(isPrivateIpAddress("::ffff:127.0.0.1")).toBe(true);
    expect(isPrivateIpAddress("::ffff:7f00:1")).toBe(true);
    expect(isPrivateIpAddress("::ffff:8.8.8.8")).toBe(false);
  });

  it("allows public addresses", () => {
    expect(isPrivateIpAddress("8.8.8.8")).toBe(false);
    expect(isPrivateIpAddress("2606:4700:4700::1111")).toBe(false);
  });
});

describe("assertSafeRemoteImageUrl", () => {
  it("accepts normal HTTPS image URLs", () => {
    expect(() => assertSafeRemoteImageUrl(new URL("https://example.com/image.png"))).not.toThrow();
  });

  it("rejects non-HTTPS, credentials, and local hostnames", () => {
    expect(() => assertSafeRemoteImageUrl(new URL("http://example.com/image.png"))).toThrow(
      /HTTPS/,
    );
    expect(() =>
      assertSafeRemoteImageUrl(new URL("https://user:pass@example.com/image.png")),
    ).toThrow(/credentials/);
    expect(() => assertSafeRemoteImageUrl(new URL("https://localhost/image.png"))).toThrow(
      /not allowed/,
    );
    expect(() => assertSafeRemoteImageUrl(new URL("https://printer.local/image.png"))).toThrow(
      /not allowed/,
    );
  });
});

describe("image formats", () => {
  it("accepts supported content types and formats", () => {
    expect(isAllowedImageContentType("image/png")).toBe(true);
    expect(isAllowedImageContentType("image/webp; charset=binary")).toBe(true);
    expect(isAllowedImageContentType("text/html")).toBe(false);
    expect(isAllowedImageContentType(null)).toBe(false);
    expect(isAllowedImageFormat("avif")).toBe(true);
    expect(isAllowedImageFormat("heif")).toBe(true);
    expect(isAllowedImageFormat("svg")).toBe(false);
  });
});
