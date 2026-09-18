import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

async function getAccessToken() {
  const session = await auth();
  const backendAccessToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  return backendAccessToken?.replace(/^Bearer\s+/i, "");
}

export async function GET(_request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  if (!backendUrl) return Response.json({ message: "The category API is not configured." }, { status: 500 });

  const token = await getAccessToken();
  if (!token) return Response.json({ message: "Please sign in to view categories." }, { status: 401 });

  const { categoryId } = await params;
  const response = await fetch(`${backendUrl}/categories/${encodeURIComponent(categoryId)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return Response.json({ message: data?.message ?? `Category API returned ${response.status} ${response.statusText}.` }, { status: response.status });
  }

  return Response.json(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  if (!backendUrl) return Response.json({ message: "The category API is not configured." }, { status: 500 });

  const token = await getAccessToken();
  if (!token) return Response.json({ message: "Please sign in to update categories." }, { status: 401 });

  const { categoryId } = await params;
  const category = (await request.json().catch(() => null)) as { categoryName?: unknown } | null;
  const categoryName = typeof category?.categoryName === "string" ? category.categoryName.trim() : "";
  if (!categoryName) {
    return Response.json({ message: "Please provide a category name." }, { status: 400 });
  }

  const response = await fetch(`${backendUrl}/categories/${encodeURIComponent(categoryId)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ categoryName }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return Response.json({ message: data?.message ?? `Category API returned ${response.status} ${response.statusText}.` }, { status: response.status });
  }

  return Response.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  if (!backendUrl) return Response.json({ success: false, message: "The category API is not configured." }, { status: 500 });

  const token = await getAccessToken();
  if (!token) return Response.json({ success: false, message: "Please sign in to delete categories." }, { status: 401 });

  const { categoryId } = await params;
  if (!/^[1-9]\d*$/.test(categoryId)) {
    return Response.json({ success: false, message: "Provide a valid category ID." }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendUrl}/categories/${encodeURIComponent(categoryId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      redirect: "error",
    });
    if (response.status === 204) return Response.json({ success: true, message: "Category deleted successfully." });

    const data: unknown = await response.json().catch(() => null);
    const body = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null;
    const message = typeof body?.message === "string" && body.message.trim() ? body.message : null;
    if (!response.ok) {
      return Response.json({ success: false, message: message ?? `Category API returned ${response.status} ${response.statusText}.` }, { status: response.status });
    }
    if (body?.success === false) {
      const status = typeof body.status === "number" && Number.isInteger(body.status) && body.status >= 400 && body.status <= 599 ? body.status : 400;
      return Response.json({ success: false, message: message ?? "Unable to delete the category." }, { status });
    }
    if (body?.success !== true) {
      return Response.json({ success: false, message: "The category API returned an invalid deletion response." }, { status: 502 });
    }

    return Response.json({ success: true, message: message ?? "Category deleted successfully." });
  } catch {
    return Response.json({ success: false, message: "The category API could not be reached. Please try again." }, { status: 502 });
  }
}