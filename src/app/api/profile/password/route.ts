import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");
const passwordFields = new Set(["currentPassword", "newPassword", "confirmPassword"]);

type PasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type BackendEnvelope = {
  success: boolean;
  message: string;
};

function reply(status: number, message: string, success = false) {
  return Response.json({ success, message }, { status });
}

function isBackendEnvelope(value: unknown): value is BackendEnvelope {
  if (!value || typeof value !== "object") return false;
  const envelope = value as Record<string, unknown>;
  return typeof envelope.success === "boolean" && typeof envelope.message === "string";
}

function parsePasswordRequest(value: unknown): PasswordRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const keys = Object.keys(body);
  if (keys.length !== passwordFields.size || !keys.every((key) => passwordFields.has(key))) return null;
  if (
    typeof body.currentPassword !== "string"
    || typeof body.newPassword !== "string"
    || typeof body.confirmPassword !== "string"
  ) return null;
  return {
    currentPassword: body.currentPassword,
    newPassword: body.newPassword,
    confirmPassword: body.confirmPassword,
  };
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return reply(403, "Cross-origin request rejected.");
  }

  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return reply(401, "Please sign in to change your password.");
  if (!backendUrl) return reply(500, "The account API is not configured.");

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return reply(415, "Send password changes as JSON.");
  }

  const body = parsePasswordRequest(await request.json().catch(() => null));
  if (!body) return reply(400, "Provide exactly the current, new, and confirmation passwords.");
  if (!body.currentPassword.trim()) return reply(400, "Enter your current password.");
  if (!body.newPassword.trim()) return reply(400, "Enter a new password.");
  if (body.newPassword.length < 8) return reply(400, "Use at least 8 characters for your new password.");
  if (body.newPassword === body.currentPassword) return reply(400, "Choose a password different from your current password.");
  if (!body.confirmPassword.trim()) return reply(400, "Confirm your new password.");
  if (body.newPassword !== body.confirmPassword) return reply(400, "New passwords do not match.");

  try {
    const response = await fetch(`${backendUrl}/auth/change-password`, {
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

    if (!isBackendEnvelope(data)) {
      return reply(502, "The account API returned an invalid response.");
    }
    if (!response.ok) return reply(response.status, data.message);
    if (!data.success) return reply(400, data.message);
    return reply(200, data.message, true);
  } catch {
    return reply(502, "The account API could not be reached. Please try again.");
  }
}
