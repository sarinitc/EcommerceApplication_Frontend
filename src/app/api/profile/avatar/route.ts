import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");
const avatarPath = process.env.AVATAR_API_PATH ?? "/profile/image";

async function proxyAvatarRequest(request: Request) {
  if (!backendUrl) return Response.json({ message: "The profile API is not configured." }, { status: 500 });
  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return Response.json({ message: "Please sign in to update your photo." }, { status: 401 });

  const headers = { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` };
  const body = await request.formData();
  const response = await fetch(`${backendUrl}${avatarPath}`, { method: "POST", headers, body, cache: "no-store" });
  const data = await response.json().catch(() => null);
  return Response.json(data ?? { message: response.statusText }, { status: response.status });
}

export function POST(request: Request) { return proxyAvatarRequest(request); }
