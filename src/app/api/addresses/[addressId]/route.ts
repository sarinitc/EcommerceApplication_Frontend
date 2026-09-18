import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function DELETE(_request: Request, { params }: { params: Promise<{ addressId: string }> }) {
  if (!backendUrl) return Response.json({ message: "The address API is not configured." }, { status: 500 });

  const session = await auth();
  const rawToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!rawToken) return Response.json({ message: "Please sign in to delete an address." }, { status: 401 });
  const token = rawToken.replace(/^Bearer\s+/i, "");

  const { addressId } = await params;
  if (!/^\d+$/.test(addressId)) return Response.json({ message: "Invalid address ID." }, { status: 400 });

  try {
    const response = await fetch(`${backendUrl}/addresses/${encodeURIComponent(addressId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      redirect: "error",
    });
    if (response.status === 204) return new Response(null, { status: 204 });
    const data = await response.json().catch(() => null);
    return Response.json(data ?? { message: response.statusText }, { status: response.status });
  } catch {
    return Response.json({ message: "The address API could not be reached. Please try again." }, { status: 502 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ addressId: string }> }) {
  if (!backendUrl) return Response.json({ message: "The address API is not configured." }, { status: 500 });

  const session = await auth();
  const rawToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!rawToken) return Response.json({ message: "Please sign in to update an address." }, { status: 401 });
  const { addressId } = await params;
  if (!/^\d+$/.test(addressId)) return Response.json({ message: "Invalid address ID." }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ message: "An address payload is required." }, { status: 400 });

  try {
    const response = await fetch(`${backendUrl}/addresses/${encodeURIComponent(addressId)}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${rawToken.replace(/^Bearer\s+/i, "")}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      redirect: "error",
    });
    const data = await response.json().catch(() => null);
    return Response.json(data ?? { message: response.statusText }, { status: response.status });
  } catch {
    return Response.json({ message: "The address API could not be reached. Please try again." }, { status: 502 });
  }
}