import { auth } from "@/auth";

const backendUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export async function POST(request: Request) {
  if (!backendUrl) return Response.json({ message: "The product API is not configured." }, { status: 500 });

  const session = await auth();
  const backendAccessToken = (session as (typeof session & { backendAccessToken?: string }) | null)?.backendAccessToken;
  if (!backendAccessToken) return Response.json({ message: "Please sign in to upload an image." }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return Response.json({ message: "An image file is required." }, { status: 400 });

  const uploadData = new FormData();
  uploadData.append("file", file, file.name);
  const response = await fetch(`${backendUrl}/products/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${backendAccessToken.replace(/^Bearer\s+/i, "")}` },
    body: uploadData,
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return Response.json({ message: data?.message ?? `Image upload returned ${response.status} ${response.statusText}.` }, { status: response.status });
  }

  return Response.json(data, { status: response.status });
}
