import { auth } from "@/auth";
import type { PromotionListResponse } from "@/src/types/promotion";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function GET() {
  if (!backendUrl) return Response.json({ message: "The promotion API is not configured." }, { status: 500 });

  const session = await auth();
  const accessToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!accessToken) return Response.json({ message: "Please sign in to view promotions." }, { status: 401 });

  const response = await fetch(`${backendUrl}/promotions`, {
    headers: { Authorization: `Bearer ${accessToken.replace(/^Bearer\s+/i, "")}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null) as PromotionListResponse | null;
  if (!response.ok) {
    return Response.json({ message: data?.message ?? `Promotion API returned ${response.status} ${response.statusText}.` }, { status: response.status });
  }

  return Response.json({
    ...data,
    payload: data?.payload ?? data?.data ?? [],
  });
}
