import type { NotificationRequest } from "@/types/notification";
export async function createNotification(data: NotificationRequest) {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });
    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string" ? payload.message : `Notification POST returned ${response.status}.`;
      console.error("[notify]", message);
    }
  } catch (error) {
    // Best-effort: a network failure must never block the underlying save.
    console.error("[notify]", error);
  }
}