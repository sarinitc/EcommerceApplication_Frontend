const productProxyPath = "/api/product-images/";
const productUploadPath = "/uploads/products/";
const backendImagePath = "/api/backend-images";

function encodeFileName(value: string) {
  // URL path segments may already be encoded by the backend.
  try {
    return encodeURIComponent(decodeURIComponent(value));
  } catch {
    return encodeURIComponent(value);
  }
}

export function resolveProductImageUrl(image: string, backendUrl: string): string {
  if (!image || /^(data:|blob:)/i.test(image)) return image;
  if (image.startsWith(productProxyPath)) return image;
  if (!image.includes("/")) return `${productProxyPath}${encodeFileName(image)}`;

  try {
    const origin = new URL(backendUrl).origin;
    const url = new URL(image, `${origin}/`);
    if (url.origin !== origin) return image;
    const index = url.pathname.indexOf(productUploadPath);
    if (index >= 0) {
      const fileName = url.pathname.slice(index + productUploadPath.length);
      if (fileName && !fileName.includes("/")) return `${productProxyPath}${encodeFileName(fileName)}`;
    }
    return url.toString();
  } catch {
    return image;
  }
}

/** Only uploaded files on the configured backend may receive a session token. */
export function getBackendImageUrl(path: string, backendUrl: string): string | null {
  if (!path.startsWith("/") || path.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(path)) return null;
  try {
    const pathname = path.split(/[?#]/, 1)[0];
    for (const part of pathname.split("/")) {
      const decoded = decodeURIComponent(part);
      if (decoded === "." || decoded === ".." || /[/\\\u0000-\u001f\u007f]/.test(decoded) || /%[0-9a-f]{2}/i.test(decoded)) return null;
    }
    const backend = new URL(backendUrl);
    const url = new URL(path, backend.origin);
    const apiUploadPath = `${backend.pathname.replace(/\/$/, "")}/uploads/`;
    if (!url.pathname.startsWith("/uploads/") && !url.pathname.startsWith(apiUploadPath)) return null;
    if (url.origin !== backend.origin || url.pathname.endsWith("/")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function resolveProfileImageUrl(image: string, backendUrl: string): string {
  if (!image || /^(data:|blob:)/i.test(image) || image.startsWith(`${backendImagePath}?`) || image.startsWith(productProxyPath)) return image;
  // Relative upload paths do not need a public backend origin. The server
  // validates this path against its API_URL before making the request.
  if (!/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(image) && (`/${image}`).includes("/uploads/")) {
    const path = image.startsWith("/") ? image : `/${image}`;
    return `${backendImagePath}?${new URLSearchParams({ path })}`;
  }
  try {
    const origin = new URL(backendUrl).origin;
    const url = new URL(image, `${origin}/`);
    if (url.origin !== origin) return image;
    const path = `${url.pathname}${url.search}`;
    if (getBackendImageUrl(path, backendUrl)) return `${backendImagePath}?${new URLSearchParams({ path })}`;
    return url.toString();
  } catch {
    return image;
  }
}

export function normalizeProfileImageResponse(data: unknown, backendUrl: string): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const result = { ...data } as Record<string, unknown>;
  for (const key of ["avatarUrl", "imageUrl", "profileImage", "profileImageUrl", "url", "image"]) {
    if (typeof result[key] === "string") result[key] = resolveProfileImageUrl(result[key], backendUrl);
  }
  for (const key of ["payload", "data"]) {
    if (result[key] && typeof result[key] === "object") result[key] = normalizeProfileImageResponse(result[key], backendUrl);
  }
  return result;
}
