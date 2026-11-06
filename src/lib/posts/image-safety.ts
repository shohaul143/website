const PRIVATE_IPV4_PATTERNS = [
  /^0\./,
  /^10\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.0\.0\./,
  /^192\.168\./,
  /^198\.(1[89])\./,
  /^2(2[4-9]|3\d)\./,
];

const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata", "instance-data"]);

const ALLOWED_CONTENT_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
]);

const ALLOWED_FORMATS = new Set([
  ...[...ALLOWED_CONTENT_TYPES].map((contentType) => contentType.slice("image/".length)),
  // Sharp reports AVIF images as the underlying HEIF container format.
  "heif",
]);

const IPV4_MAPPED_PATTERN = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i;
const IPV4_MAPPED_HEX_PATTERN = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i;

function isPrivateIpv4(address: string): boolean {
  return PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(address));
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase();
  const mapped = normalized.match(IPV4_MAPPED_PATTERN);

  if (mapped) {
    return isPrivateIpv4(mapped[1]);
  }

  const hexMapped = normalized.match(IPV4_MAPPED_HEX_PATTERN);

  if (hexMapped) {
    const high = Number.parseInt(hexMapped[1], 16);
    const low = Number.parseInt(hexMapped[2], 16);

    return isPrivateIpv4(`${high >> 8}.${high & 0xff}.${low >> 8}.${low & 0xff}`);
  }

  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

export function isPrivateIpAddress(address: string): boolean {
  return address.includes(":") ? isPrivateIpv6(address) : isPrivateIpv4(address);
}

export function assertSafeRemoteImageUrl(url: URL): void {
  if (url.protocol !== "https:") {
    throw new Error("Remote images must use HTTPS");
  }

  if (url.username || url.password) {
    throw new Error("Remote image URLs cannot contain credentials");
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

  if (
    !hostname ||
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".localhost")
  ) {
    throw new Error(`Remote image host "${url.hostname}" is not allowed`);
  }
}

export function isAllowedImageContentType(contentType: string | null): boolean {
  if (!contentType) {
    return false;
  }

  return ALLOWED_CONTENT_TYPES.has(contentType.split(";")[0].trim().toLowerCase());
}

export function isAllowedImageFormat(format: string | undefined): boolean {
  return format !== undefined && ALLOWED_FORMATS.has(format);
}
