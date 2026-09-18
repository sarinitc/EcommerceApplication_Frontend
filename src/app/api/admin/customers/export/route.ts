import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");
const cacheControl = "private, no-store";

function exportError(message: string, status: number) {
  return Response.json({ message }, { status, headers: { "Cache-Control": cacheControl } });
}

export async function GET(request: Request) {
  if (!backendUrl) return exportError("The customer API is not configured.", 500);

  const session = await auth();
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return exportError("Please sign in to export customers.", 401);
  if (!(session?.user as { roles?: string[] } | undefined)?.roles?.includes("ADMIN")) {
    return exportError("Administrator access is required.", 403);
  }

  const params = new URL(request.url).searchParams;
  const search = params.get("search")?.trim();
  const status = params.get("status")?.trim().toUpperCase();
  if (status && status !== "ALL" && !["INVITED", "ACTIVE", "BLOCKED"].includes(status)) {
    return exportError("CSV export supports INVITED, ACTIVE, or BLOCKED. Set the Status filter to All to export all customers.", 400);
  }
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (status && status !== "ALL") query.set("status", status);

  try {
    const response = await fetch(`${backendUrl}/admin/customers/export${query.toString() ? `?${query}` : ""}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}`,
        Accept: "text/csv",
      },
      cache: "no-store",
      redirect: "error",
    });
    const contentType = response.headers.get("Content-Type");
    if (!response.ok || contentType?.toLowerCase().includes("json")) {
      const data: unknown = await response.json().catch(() => null);
      const body = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null;
      const message = typeof body?.message === "string" && body.message.trim() ? body.message : null;
      if (!response.ok) {
        return exportError(message ?? `Customer export API returned HTTP ${response.status}.`, response.status);
      }
      const errorStatus = typeof body?.status === "number" && Number.isInteger(body.status) && body.status >= 400 && body.status <= 599
        ? body.status
        : body?.success === false ? 400 : 502;
      return exportError(message ?? "The customer API returned an invalid export response.", errorStatus);
    }

    const raw = new Uint8Array(await response.arrayBuffer());
    if (!raw.length) return exportError("The customer API returned an empty export response.", 502);

    const probe = new TextDecoder().decode(raw.slice(0, 32)).trimStart();
    if (probe.startsWith("{") || probe.startsWith("[")) {
      let body: Record<string, unknown> | null = null;
      try {
        const parsed: unknown = JSON.parse(new TextDecoder().decode(raw));
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) body = parsed as Record<string, unknown>;
      } catch {
        body = null;
      }
      const message = typeof body?.message === "string" && body.message.trim() ? body.message : null;
      const errorStatus = typeof body?.status === "number" && Number.isInteger(body.status) && body.status >= 400 && body.status <= 599
        ? body.status
        : body?.success === false ? 400 : 502;
      return exportError(message ?? "The customer API returned an invalid export response.", errorStatus);
    }

    return new Response(raw, {
      headers: {
        "Content-Type": contentType || "text/csv; charset=utf-8",
        "Content-Disposition": response.headers.get("Content-Disposition") || 'attachment; filename="customers.csv"',
        "Cache-Control": cacheControl,
      },
    });
  } catch {
    return exportError("The customer API could not be reached. Please try again.", 502);
  }
}
