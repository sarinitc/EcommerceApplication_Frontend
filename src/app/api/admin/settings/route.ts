import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

async function getToken() {
  const session = await auth();
  const accessToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  return accessToken?.replace(/^Bearer\s+/i, "");
}

async function proxy(request: Request, path: string, method: "GET" | "PATCH") {
  if (!backendUrl) return Response.json({ message: "The store settings API is not configured." }, { status: 500 });
  const token = await getToken();
  if (!token) return Response.json({ message: "Please sign in to manage store settings." }, { status: 401 });

  const headers: HeadersInit = { Authorization: `Bearer ${token}` };
  let body: string | undefined;
  if (method === "PATCH") {
    headers["Content-Type"] = "application/json";
    body = await request.text();
  }

  try {
    const response = await fetch(`${backendUrl}${path}`, { method, headers, body, cache: "no-store" });
    const data = await response.json().catch(() => null);
    return Response.json(data ?? { message: "The store settings API returned an empty response." }, { status: response.status });
  } catch {
    return Response.json({ message: "The store settings API could not be reached." }, { status: 502 });
  }
}

export async function GET(request: Request) {
  return proxy(request, "/admin/settings", "GET");
}
