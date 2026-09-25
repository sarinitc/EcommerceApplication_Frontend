import { auth } from "@/auth";

const maxImageBytes = 5 * 1024 * 1024;
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request, { params }: { params: Promise<{ customerId: string }> }) {
  const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");
  if (!backendUrl) return Response.json({ message: "The customer API is not configured." }, { status: 500 });
  const session = await auth();
  if (!(session?.user as { roles?: string[] } | undefined)?.roles?.includes("ADMIN")) {
    return Response.json({ message: "Administrator access is required." }, { status: 403 });
  }
  const token = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!token) return Response.json({ message: "Please sign in to upload customer images." }, { status: 401 });
  const { customerId } = await params;
  if (!/^[1-9]\d*$/.test(customerId) || !Number.isSafeInteger(Number(customerId))) {
    return Response.json({ message: "Invalid customer ID." }, { status: 400 });
  }
  const input = await request.formData().catch(() => null);
  const file = input?.get("file");
  if (!(file instanceof Blob) || typeof (file as File).name !== "string" || file.size === 0) {
    return Response.json({ message: "An image file is required." }, { status: 400 });
  }
  if (!imageTypes.has(file.type)) {
    return Response.json({ message: "Use a JPEG, PNG, or WebP image." }, { status: 400 });
  }
  if (file.size > maxImageBytes) {
    return Response.json({ message: "Image must be 5 MB or smaller." }, { status: 413 });
  }
  const outgoing = new FormData();
  outgoing.append("file", file, (file as File).name);
  try {
    const response = await fetch(`${backendUrl}/admin/customers/${customerId}/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` },
      body: outgoing,
      cache: "no-store",
      redirect: "error",
    });
    const result = await response.json().catch(() => null) as {
      success?: boolean; status?: number; message?: string; payload?: { profileImage?: string };
    } | null;
    if (!response.ok) {
      return Response.json(result ?? { message: `Customer image upload failed (${response.status}).` }, { status: response.status });
    }
    if (result?.success === false) {
      const status = result.status && result.status >= 400 && result.status <= 599 ? result.status : 502;
      return Response.json(result, { status });
    }
    if (result?.success !== true || !result.payload || typeof result.payload.profileImage !== "string" || !result.payload.profileImage) {
      return Response.json({ message: "Customer image service returned an invalid response." }, { status: 502 });
    }
    return Response.json(result, { status: response.status });
  } catch {
    return Response.json({ message: "Customer image service is unavailable." }, { status: 502 });
  }
}
