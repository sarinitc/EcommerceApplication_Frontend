import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

type CheckoutRequest = {
  cartId?: unknown;
  paymentId?: unknown;
};

export async function POST(request: Request) {
  if (!backendUrl) return Response.json({ message: "The order API is not configured." }, { status: 500 });

  const session = await auth();
  const rawToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!rawToken) return Response.json({ message: "Please sign in to place an order." }, { status: 401 });

  const body = await request.json().catch(() => null) as CheckoutRequest | null;
  const cartId = Number(body?.cartId);
  const paymentId = Number(body?.paymentId);
  if (!Number.isInteger(cartId) || cartId <= 0 || !Number.isInteger(paymentId) || paymentId <= 0) {
    return Response.json({ message: "A valid cartId and paymentId are required to place an order." }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendUrl}/orders/checkout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${rawToken.replace(/^Bearer\s+/i, "")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cartId, paymentId }),
      cache: "no-store",
      redirect: "error",
    });
    const data = await response.json().catch(() => null);
    return Response.json(data ?? { message: response.statusText }, { status: response.status });
  } catch {
    return Response.json({ message: "The order API could not be reached. Please try again." }, { status: 502 });
  }
}
