import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function GET(_request: Request, { params }: { params: Promise<{ fileName: string }> }) {
  if (!backendUrl) return new Response(null, { status: 500 });

  const session = await auth();
  const backendAccessToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!backendAccessToken) return new Response(null, { status: 401 });

  const { fileName } = await params;
  const response = await fetch(`${backendUrl}/uploads/products/${encodeURIComponent(fileName)}`, {
    headers: { Authorization: `Bearer ${backendAccessToken.replace(/^Bearer\s+/i, "")}` },
    cache: "no-store",
  });

  if (!response.ok || !response.body) return new Response(null, { status: response.status });

  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  });
}
