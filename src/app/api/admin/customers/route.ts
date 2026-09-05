import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function GET(request: Request) {
  if (!backendUrl) return Response.json({ message: "The customer API is not configured." }, { status: 500 });
  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return Response.json({ message: "Please sign in to view customers." }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const query = new URLSearchParams({ page: params.get("page") ?? "0", size: params.get("size") ?? "20" });
  const search = params.get("search")?.trim();
  if (search) query.set("search", search);
  const response = await fetch(`${backendUrl}/admin/customers?${query}`, { headers: { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` }, cache: "no-store" });
  const data = await response.json().catch(() => null);
  return Response.json(data ?? { message: response.statusText }, { status: response.status });
}

export async function POST(request: Request) {
  if (!backendUrl) return Response.json({ message: "The customer API is not configured." }, { status: 500 });
  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return Response.json({ message: "Please sign in to create customers." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ message: "A customer payload is required." }, { status: 400 });
  const response = await fetch(`${backendUrl}/admin/customers`, { method: "POST", headers: { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}`, "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const data = await response.json().catch(() => null);
  return Response.json(data ?? { message: response.statusText }, { status: response.status });
}
