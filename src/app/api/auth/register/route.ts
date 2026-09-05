const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

type RegisterRequest = { username?: unknown; email?: unknown; password?: unknown };

export async function POST(request: Request) {
  if (!backendUrl) return Response.json({ message: "The authentication API is not configured." }, { status: 500 });

  const body = await request.json().catch(() => null) as RegisterRequest | null;
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!username || !email || !password) return Response.json({ message: "Name, email, and password are required." }, { status: 400 });

  const response = await fetch(`${backendUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  return Response.json(data ?? { message: `Registration failed with status ${response.status}.` }, { status: response.status });
}
