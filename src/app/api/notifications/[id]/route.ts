import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

function reply(status: number, message: string, extra: Record<string, unknown> = {}) {
  return Response.json({ success: status < 400, message, ...extra }, { status });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!backendUrl) return reply(500, "The notification API is not configured.");

  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return reply(401, "Please sign in to manage notifications.");

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) return reply(415, "Send notification updates as JSON.");

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return reply(400, "Send a valid notification update body.");

  try {
    const response = await fetch(`${backendUrl}/notifications/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      redirect: "error",
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message = data && typeof data === "object" && "message" in data && typeof data.message === "string" ? data.message : null;
      return reply(response.status, message ?? `Notification API returned ${response.status} ${response.statusText}.`);
    }
    return reply(200, "Notification updated.", { notification: data ?? null });
  } catch {
    return reply(502, "The notification API could not be reached. Please try again.");
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!backendUrl) return reply(500, "The notification API is not configured.");

  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return reply(401, "Please sign in to manage notifications.");

  try {
    const response = await fetch(`${backendUrl}/notifications/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` },
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok) {
      const data: unknown = await response.json().catch(() => null);
      const message = data && typeof data === "object" && "message" in data && typeof data.message === "string" ? data.message : null;
      return reply(response.status, message ?? `Notification API returned ${response.status} ${response.statusText}.`);
    }
    return reply(200, "Notification deleted.", { ok: true });
  } catch {
    return reply(502, "The notification API could not be reached. Please try again.");
  }
}