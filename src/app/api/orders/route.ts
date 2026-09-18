import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function GET() {
  if (!backendUrl) return Response.json({ message: "The order API is not configured." }, { status: 500 });

  const session = await auth();
  const rawToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!rawToken) return Response.json({ message: "Please sign in to view orders." }, { status: 401 });

  try {
    const response = await fetch(`${backendUrl}/orders`, {
      headers: { Authorization: `Bearer ${rawToken.replace(/^Bearer\s+/i, "")}` },
      cache: "no-store",
      redirect: "error",
    });
    const data = await response.json().catch(() => null);
    return Response.json(data ?? { message: response.statusText }, { status: response.status });
  } catch {
    return Response.json({ message: "The order API could not be reached. Please try again." }, { status: 502 });
  }
}
