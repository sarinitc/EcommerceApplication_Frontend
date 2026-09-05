const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export function getApiUrl(path: string) {
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  return `${apiUrl}${path}`;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}
