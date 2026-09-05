"use client";

/* Product image URLs are backend-controlled and local object URLs cannot use the Next.js image optimizer. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";
import type { ApiResponse, ImageUploadResponse, Product, ProductRequest } from "@/src/lib/products";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 5 * 1024 * 1024;

export function EditProductForm() {
  const router = useRouter();
  const { productId } = useParams<{ productId: string }>();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [stock, setStock] = useState("");
  const [replacementImage, setReplacementImage] = useState<File | null>(null);
  const [replacementPreview, setReplacementPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const specialPrice = useMemo(
    () => Math.max(0, Number(price || 0) * (1 - Number(discount || 0) / 100)),
    [price, discount],
  );

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json() as ApiResponse<Product> | { message?: string };
        if (!response.ok || !("payload" in data)) throw new Error(data.message ?? "Unable to load product.");
        setProduct(data.payload);
        setPrice(String(data.payload.price));
        setDiscount(String(data.payload.discount ?? 0));
        setStock(String(data.payload.quantity));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load product.");
      }
    }

    void loadProduct();
  }, [productId]);

  function selectReplacementImage(file: File | undefined) {
    if (!file) return;
    if (!acceptedImageTypes.has(file.type) || file.size > maxImageBytes) {
      setError("Choose a JPG, PNG, or WEBP image no larger than 5MB.");
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setReplacementImage(file);
    setReplacementPreview(previewUrl);
    setError(null);
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product || Number(price) <= 0 || Number(discount) < 0 || Number(discount) > 100 || !Number.isInteger(Number(stock)) || Number(stock) < 0 || !product.category?.categoryId || !product.seller?.sellerId) {
      setError("A valid price, discount, whole-number stock quantity, category, and seller are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      let imageUrl = product.image;
      if (replacementImage) {
        const uploadData = new FormData();
        uploadData.append("file", replacementImage);
        const uploadResponse = await fetch("/api/products/uploads", { method: "POST", body: uploadData });
        const uploadResult = await uploadResponse.json() as ApiResponse<ImageUploadResponse> | { message?: string };
        if (!uploadResponse.ok || !("payload" in uploadResult)) throw new Error(uploadResult.message ?? "Unable to upload the replacement image.");
        imageUrl = uploadResult.payload.imageUrl;
      }

      const request: ProductRequest = {
        productName: product.productName,
        description: product.description,
        price: Number(price),
        discount: Number(discount),
        specialPrice,
        quantity: Number(stock),
        image: imageUrl,
        categoryId: product.category.categoryId,
        sellerId: product.seller.sellerId,
      };
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const data = await response.json() as ApiResponse<Product> | { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Unable to update the product.");

      addToast({ title: "Product updated successfully", color: "success", severity: "success", variant: "solid", timeout: 4000 });
      router.push("/admin/products");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update the product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (error && !product) return <main className="min-h-screen bg-[#f8f8f6] p-8"><p className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p></main>;
  if (!product) return <main className="min-h-screen bg-[#f8f8f6] p-8 text-center text-sm text-slate-500">Loading product…</main>;

  return <main className="min-h-screen bg-[#f8f8f6] px-5 py-8 text-[#172033] sm:px-8 lg:px-10">
    <div className="mx-auto max-w-2xl">
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link className="hover:text-[#4f46d9]" href="/admin/products">Products</Link><span>›</span><span>Edit Product</span>
      </nav>
      <div className="mt-6 border-b border-slate-200 pb-7">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#5c56d3]">Product pricing</p>
        <h1 className="mt-2 font-[Georgia,serif] text-4xl font-semibold tracking-[-.055em]">Edit Product</h1>
        <p className="mt-2 text-sm text-slate-500">Update the price, stock, discount, or image for {product.productName}.</p>
      </div>
      <form className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_25px_rgba(23,32,51,.05)] sm:p-7" onSubmit={saveProduct}>
        <div className="flex gap-4 border-b border-slate-100 pb-6">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {(replacementPreview || product.image) && <img className="h-full w-full object-cover" src={replacementPreview ?? product.image} alt="Product preview" />}
          </div>
          <div>
            <p className="text-xs text-slate-500">Product #{product.productId}</p>
            <h2 className="mt-1 font-semibold">{product.productName}</h2>
            <p className="mt-1 text-sm text-slate-500">{product.category.categoryName}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Price *
            <input className="rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-[#4f46d9] focus:ring-3 focus:ring-[#e8e7ff]" type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Discount (%) *
            <input className="rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-[#4f46d9] focus:ring-3 focus:ring-[#e8e7ff]" type="number" min="0" max="100" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Stock Quantity *
            <input className="rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none focus:border-[#4f46d9] focus:ring-3 focus:ring-[#e8e7ff]" type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} required />
          </label>
        </div>
        <div className="mt-5 rounded-xl bg-[#f0efff] p-4">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4f46d9]">Special Price</p>
          <p className="mt-1 text-3xl font-bold text-[#332dac]">{currency.format(specialPrice)}</p>
          <p className="mt-1 text-xs text-slate-500">Calculated automatically from price and discount.</p>
        </div>
        <section className="mt-6 border-t border-slate-100 pt-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-semibold">Product Image</h2><p className="mt-1 text-sm text-slate-500">Replace the current image with a JPG, PNG, or WEBP file up to 5MB.</p></div>
            {replacementImage && <span className="text-xs font-bold text-[#4f46d9]">New image selected</span>}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="rounded-xl border border-[#4f46d9] px-4 py-2.5 text-sm font-bold text-[#433bc8] transition hover:bg-[#f0efff]" type="button" onClick={() => imageInputRef.current?.click()}>Replace Image</button>
            {replacementImage && <button className="text-sm font-semibold text-slate-500 hover:text-red-600" type="button" onClick={() => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; setReplacementImage(null); setReplacementPreview(null); }}>Keep current image</button>}
            <input ref={imageInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { selectReplacementImage(event.target.files?.[0]); event.target.value = ""; }} />
          </div>
        </section>
        {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
        <div className="mt-7 flex justify-end gap-3">
          <Link className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50" href="/admin/products">Cancel</Link>
          <button className="rounded-xl bg-[#4f46d9] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(79,70,217,.24)] hover:bg-[#4038c8] disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save Changes"}</button>
        </div>
      </form>
    </div>
  </main>;
}
