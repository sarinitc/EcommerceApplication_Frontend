type SaveOptions = {
  mode: "create" | "edit";
  customerId?: number;
  createPayload: Record<string, unknown>;
  editPayload: Record<string, unknown>;
  imageFile: Blob | null;
  fetchImpl?: typeof fetch;
  onCustomerCreated?: (customerId: number) => void;
};

export class CustomerSaveError extends Error {
  constructor(message: string, readonly customerId?: number, readonly stage: "save" | "image" | "unknown-id" = "save") {
    super(message);
    this.name = "CustomerSaveError";
  }
}

type ApiResult = { success?: boolean; message?: string; payload?: { customerId?: number } } | null;

export async function saveCustomer({ mode, customerId, createPayload, editPayload, imageFile, fetchImpl = fetch, onCustomerCreated }: SaveOptions) {
  let id = customerId;
  if (mode === "edit" && (!Number.isSafeInteger(id) || !id || id < 1)) {
    throw new CustomerSaveError("Invalid customer ID.");
  }
  const creating = mode === "create" && !id;
  const url = creating ? "/api/admin/customers" : `/api/admin/customers/${id}`;
  const payload = creating ? createPayload : editPayload;
  const safePayload = typeof payload.profileImage === "string" && /^\s*blob:/i.test(payload.profileImage)
    ? { ...payload, profileImage: null }
    : payload;
  const response = await fetchImpl(url, {
    method: creating ? "POST" : "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(safePayload),
  });
  const result = await response.json().catch(() => null) as ApiResult;
  if (!response.ok || result?.success === false) {
    throw new CustomerSaveError(result?.message ?? `Unable to ${creating ? "create" : "update"} customer.`, id);
  }
  if (creating) {
    id = result?.payload?.customerId;
    if (!Number.isSafeInteger(id) || !id || id < 1) {
      throw new CustomerSaveError("Customer was created, but its ID was missing. Open the customer list before trying again so it is not created twice.", undefined, "unknown-id");
    }
    onCustomerCreated?.(id);
  }
  if (imageFile) {
    const form = new FormData();
    form.append("file", imageFile);
    try {
      const upload = await fetchImpl(`/api/admin/customers/${id}/image`, { method: "POST", body: form });
      const uploadResult = await upload.json().catch(() => null) as ApiResult;
      if (!upload.ok || uploadResult?.success === false) {
        throw new Error(uploadResult?.message ?? "Unable to upload customer image.");
      }
    } catch (cause) {
      throw new CustomerSaveError(`Customer details were saved, but the image upload failed: ${cause instanceof Error ? cause.message : "Unknown error"}`, id, "image");
    }
  }
  return { customerId: id };
}
