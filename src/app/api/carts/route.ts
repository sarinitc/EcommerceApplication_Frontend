import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

type SessionWithBackend = { backendAccessToken?: string; backendUserId?: string | number };
type UserResponse = { payload?: { userId?: string | number } };

async function getSessionData() {
  const session = await auth();
  const sessionData = session as (typeof session & SessionWithBackend) | null;
  const rawToken = sessionData?.backendAccessToken;
  if (!rawToken) return null;

  let userId = Number(sessionData?.backendUserId);
  const token = rawToken.replace(/^Bearer\s+/i, "");
  if (!Number.isInteger(userId) || userId <= 0) {
    const response = await fetch(`${backendUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await response.json().catch(() => null) as UserResponse | null;
    userId = Number(data?.payload?.userId);
  }

  return Number.isInteger(userId) && userId > 0 ? { token, userId } : null;
}

export async function POST() {
  if (!backendUrl) return Response.json({ message: "The cart API is not configured." }, { status: 500 });

  const sessionData = await getSessionData();
  if (!sessionData) return Response.json({ message: "Please sign in to create a cart." }, { status: 401 });

  try {
    const response = await fetch(`${backendUrl}/carts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionData.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: sessionData.userId }),
      cache: "no-store",
      redirect: "error",
    });
    const data = await response.json().catch(() => null);
    return Response.json(data ?? { message: response.statusText }, { status: response.status });
  } catch {
    return Response.json({ message: "The cart API could not be reached. Please try again." }, { status: 502 });
  }
}
