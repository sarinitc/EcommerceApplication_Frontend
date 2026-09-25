import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

async function getAccessToken() {
  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  return token?.replace(/^Bearer\s+/i, "");
}

export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  if (!backendUrl) return Response.json({ success: false, message: "The order API is not configured." }, { status: 500 });

  const token = await getAccessToken();
  if (!token) return Response.json({ success: false, message: "Please sign in to update orders." }, { status: 401 });

  const { orderId } = await params;
  if (!/^[1-9]\d*$/.test(orderId)) return Response.json({ success: false, message: "Provide a valid order ID." }, { status: 400 });

  const body = (await request.json().catch(() => null)) as { orderStatus?: unknown } | null;
  const orderStatus = typeof body?.orderStatus === "string" ? body.orderStatus.trim() : "";
  if (!orderStatus) return Response.json({ success: false, message: "Provide an order status." }, { status: 400 });

  try {
    const response = await fetch(`${backendUrl}/orders/${encodeURIComponent(orderId)}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus }),
      cache: "no-store",
      redirect: "error",
    });
    const data: unknown = await response.json().catch(() => null);
    const bodyObject = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null;
    const message = typeof bodyObject?.message === "string" && bodyObject.message.trim() ? bodyObject.message : null;
    if (!response.ok) {
      return Response.json({ success: false, message: message ?? `Order API returned ${response.status} ${response.statusText}.` }, { status: response.status });
    }
    if (bodyObject?.success === false) {
      const status = typeof bodyObject.status === "number" && Number.isInteger(bodyObject.status) && bodyObject.status >= 400 && bodyObject.status <= 599 ? bodyObject.status : 400;
      return Response.json({ success: false, message: message ?? "Unable to update the order status." }, { status });
    }
    return Response.json({ success: true, message: message ?? "Order status updated successfully." });
  } catch {
    return Response.json({ success: false, message: "The order API could not be reached. Please try again." }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  if (!backendUrl) return Response.json({ success: false, message: "The order API is not configured." }, { status: 500 });

  const token = await getAccessToken();
  if (!token) return Response.json({ success: false, message: "Please sign in to delete orders." }, { status: 401 });

  const { orderId } = await params;
  if (!/^[1-9]\d*$/.test(orderId)) return Response.json({ success: false, message: "Provide a valid order ID." }, { status: 400 });

  try {
    const response = await fetch(`${backendUrl}/orders/${encodeURIComponent(orderId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      redirect: "error",
    });
    if (response.status === 204) return Response.json({ success: true, message: "Order deleted successfully." });

    const data: unknown = await response.json().catch(() => null);
    const body = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null;
    const message = typeof body?.message === "string" && body.message.trim() ? body.message : null;
    if (!response.ok) {
      return Response.json({ success: false, message: message ?? `Order API returned ${response.status} ${response.statusText}.` }, { status: response.status });
    }
    if (body?.success === false) {
      const status = typeof body.status === "number" && Number.isInteger(body.status) && body.status >= 400 && body.status <= 599 ? body.status : 400;
      return Response.json({ success: false, message: message ?? "Unable to delete the order." }, { status });
    }
    if (body?.success !== true) {
      return Response.json({ success: false, message: "The order API returned an invalid deletion response." }, { status: 502 });
    }
    return Response.json({ success: true, message: message ?? "Order deleted successfully." });
  } catch {
    return Response.json({ success: false, message: "The order API could not be reached. Please try again." }, { status: 502 });
  }
}