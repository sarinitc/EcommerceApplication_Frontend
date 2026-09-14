import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");
const avatarPath = process.env.AVATAR_API_PATH ?? "/profile/image";
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

async function proxyAvatarRequest(request: Request) {
  if (!backendUrl) return Response.json({ message: "The profile API is not configured." }, { status: 500 });
  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return Response.json({ message: "Please sign in to update your photo." }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File) || file.size === 0) return Response.json({ message: "An image file is required." }, { status: 400 });
  if (!acceptedTypes.has(file.type)) return Response.json({ message: "Choose a JPG, PNG, or WebP image." }, { status: 400 });
  if (file.size > maxFileSize) return Response.json({ message: "Choose an image smaller than 5 MB." }, { status: 413 });

  const headers = { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` };
  const body = new FormData();
  body.append("file", file, file.name);

  try {
    const response = await fetch(`${backendUrl}${avatarPath}`, { method: "POST", headers, body, cache: "no-store" });
    const data: unknown = await response.json().catch(() => null);
    if (data === null) {
      return Response.json({ message: response.ok ? "The profile API did not return the uploaded photo." : `Photo upload failed (${response.status}).` }, { status: response.ok ? 502 : response.status });
    }
    return Response.json(data, { status: response.status });
  } catch {
    return Response.json({ message: "The profile API could not be reached. Please try again." }, { status: 502 });
  }
}

export function POST(request: Request) { return proxyAvatarRequest(request); }
