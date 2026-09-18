import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function GET() {
  if (!backendUrl) return Response.json({ message: "The address API is not configured." }, { status: 500 });
  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return Response.json({ message: "Please sign in to view addresses." }, { status: 401 });
  if (!(session?.user as { roles?: string[] } | undefined)?.roles?.includes("ADMIN")) {
    return Response.json({ message: "Administrator access is required." }, { status: 403 });
  }
  try {
    const response = await fetch(`${backendUrl}/addresses`, { headers: { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` }, cache: "no-store", redirect: "error" });
    const data = await response.json().catch(() => null);
    return Response.json(data ?? { message: response.statusText }, { status: response.status });
  } catch {
    return Response.json({ message: "The address API could not be reached. Please try again." }, { status: 502 });
  }
}