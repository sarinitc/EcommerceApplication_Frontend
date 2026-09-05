import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function GET() {
  if (!backendUrl) return Response.json({ message: "The category API is not configured." }, { status: 500 });

  const session = await auth();
  const backendAccessToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!backendAccessToken) return Response.json({ message: "Please sign in to view categories." }, { status: 401 });

  const response = await fetch(`${backendUrl}/categories`, {
    headers: { Authorization: `Bearer ${backendAccessToken.replace(/^Bearer\s+/i, "")}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return Response.json({ message: data?.message ?? `Category API returned ${response.status} ${response.statusText}.` }, { status: response.status });
  }

  return Response.json(data);
}
