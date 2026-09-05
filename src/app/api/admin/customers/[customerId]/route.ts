import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function DELETE(_: Request, { params }: { params: Promise<{ customerId: string }> }) {
  if (!backendUrl) return Response.json({ message: "The customer API is not configured." }, { status: 500 });
  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return Response.json({ message: "Please sign in to delete customers." }, { status: 401 });
  const { customerId } = await params;
  if (!/^\d+$/.test(customerId)) return Response.json({ message: "Invalid customer ID." }, { status: 400 });
  const response = await fetch(`${backendUrl}/admin/customers/${customerId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` }, cache: "no-store" });
  const data = await response.json().catch(() => null);
  if (response.status === 204) return new Response(null, { status: 204 });
  return Response.json(data ?? { message: response.statusText }, { status: response.status });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ customerId: string }> }) {
  if (!backendUrl) return Response.json({ message: "The customer API is not configured." }, { status: 500 });
  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return Response.json({ message: "Please sign in to update customers." }, { status: 401 });
  const { customerId } = await params;
  if (!/^\d+$/.test(customerId)) return Response.json({ message: "Invalid customer ID." }, { status: 400 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ message: "A customer update payload is required." }, { status: 400 });
  const response = await fetch(`${backendUrl}/admin/customers/${customerId}`, { method: "PATCH", headers: { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}`, "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const data = await response.json().catch(() => null);
  return Response.json(data ?? { message: response.statusText }, { status: response.status });
}
