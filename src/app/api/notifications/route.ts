import { auth } from "@/auth";
import type { Notification, NotificationRequest } from "@/types/notification";
import { NOTIFICATION_TYPES } from "@/types/notification";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

function isNotification(value: unknown): value is Notification {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "number"
    && typeof item.type === "string"
    && (NOTIFICATION_TYPES as readonly string[]).includes(item.type)
    && typeof item.title === "string"
    && typeof item.message === "string"
    && typeof item.read === "boolean";
}

function parseNotificationRequest(value: unknown): NotificationRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (typeof body.type !== "string" || !(NOTIFICATION_TYPES as readonly string[]).includes(body.type)) return null;
  if (typeof body.title !== "string" || !body.title.trim()) return null;
  if (typeof body.message !== "string" || !body.message.trim()) return null;
  const request: NotificationRequest = {
    type: body.type as NotificationRequest["type"],
    title: body.title,
    message: body.message,
    read: false,
  };
  if (typeof body.referenceId === "number") request.referenceId = body.referenceId;
  if (typeof body.referenceType === "string" && body.referenceType.trim()) request.referenceType = body.referenceType;
  return request;
}

export async function GET() {
  if (!backendUrl) return Response.json({ message: "The notification API is not configured." }, { status: 500 });

  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return Response.json({ message: "Please sign in to view notifications." }, { status: 401 });

  try {
    const response = await fetch(`${backendUrl}/notifications`, {
      headers: { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` },
      cache: "no-store",
      redirect: "error",
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message = data && typeof data === "object" && "message" in data && typeof data.message === "string" ? data.message : null;
      return Response.json({ message: message ?? `Notification API returned ${response.status} ${response.statusText}.` }, { status: response.status });
    }
    const notifications = Array.isArray(data) ? data.filter(isNotification) : [];
    return Response.json({ notifications });
  } catch {
    return Response.json({ message: "The notification API could not be reached. Please try again." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!backendUrl) return Response.json({ message: "The notification API is not configured." }, { status: 500 });

  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return Response.json({ message: "Please sign in to create notifications." }, { status: 401 });

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) return Response.json({ message: "Send notifications as JSON." }, { status: 415 });

  const body = parseNotificationRequest(await request.json().catch(() => null));
  if (!body) return Response.json({ message: "Provide a valid notification type, title, and message." }, { status: 400 });

  try {
    const response = await fetch(`${backendUrl}/notifications`, {
      method: "POST",
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
      return Response.json({ message: message ?? `Notification API returned ${response.status} ${response.statusText}.` }, { status: response.status });
    }
    return Response.json({ notification: data ?? null });
  } catch {
    return Response.json({ message: "The notification API could not be reached. Please try again." }, { status: 502 });
  }
}