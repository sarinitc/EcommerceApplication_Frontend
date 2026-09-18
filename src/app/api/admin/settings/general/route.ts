import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function PATCH(request: Request) {
  if (!backendUrl) return Response.json({ message: "The store settings API is not configured." }, { status: 500 });

  const session = await auth();
  const accessToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!accessToken) return Response.json({ message: "Please sign in to manage store settings." }, { status: 401 });

  try {
    const response = await fetch(`${backendUrl}/admin/settings/general`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken.replace(/^Bearer\s+/i, "")}`,
        "Content-Type": "application/json",
      },
      body: await request.text(),
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    return Response.json(data ?? { message: "The store settings API returned an empty response." }, { status: response.status });
  } catch {
    return Response.json({ message: "The store settings API could not be reached." }, { status: 502 });
  }
}
