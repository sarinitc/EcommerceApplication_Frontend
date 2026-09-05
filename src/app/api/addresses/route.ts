import { auth } from "@/auth";
import type { AddressRequest } from "@/src/types/address";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function POST(request: Request) {
  if (!backendUrl) return Response.json({ message: "The address API is not configured." }, { status: 500 });

  const session = await auth();
  const accessToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!accessToken) return Response.json({ message: "Please sign in to save an address." }, { status: 401 });

  const body = await request.json().catch(() => null) as AddressRequest | null;
  if (!body?.street?.trim() || !body.city?.trim() || !body.country?.trim() || !body.pincode?.trim()) {
    return Response.json({ message: "Street, city, country, and postal code are required." }, { status: 400 });
  }

  const response = await fetch(`${backendUrl}/addresses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken.replace(/^Bearer\s+/i, "")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null) as { message?: string } | null;

  if (!response.ok) {
    return Response.json({ message: data?.message ?? `Address API returned ${response.status} ${response.statusText}.` }, { status: response.status });
  }

  return Response.json(data, { status: response.status });
}
