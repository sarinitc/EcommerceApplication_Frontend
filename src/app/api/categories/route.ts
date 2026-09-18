import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

async function getAccessToken() {
  const session = await auth();
  const backendAccessToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  return backendAccessToken?.replace(/^Bearer\s+/i, "");
}

export async function GET() {
  if (!backendUrl) return Response.json({ message: "The category API is not configured." }, { status: 500 });

  const token = await getAccessToken();
  if (!token) return Response.json({ message: "Please sign in to view categories." }, { status: 401 });

  const response = await fetch(`${backendUrl}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return Response.json({ message: data?.message ?? `Category API returned ${response.status} ${response.statusText}.` }, { status: response.status });
  }

  return Response.json(data);
}

export async function POST(request: Request) {
  if (!backendUrl) return Response.json({ message: "The category API is not configured." }, { status: 500 });

  const token = await getAccessToken();
  if (!token) return Response.json({ message: "Please sign in to create categories." }, { status: 401 });

  const category = (await request.json().catch(() => null)) as { categoryName?: unknown } | null;
  const categoryName = typeof category?.categoryName === "string" ? category.categoryName.trim() : "";
  if (!categoryName) {
    return Response.json({ message: "Please provide a category name." }, { status: 400 });
  }

  const response = await fetch(`${backendUrl}/categories`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ categoryName }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return Response.json({ message: data?.message ?? `Category API returned ${response.status} ${response.statusText}.` }, { status: response.status });
  }

  return Response.json(data, { status: response.status });
}
