"use client";

/* Local object URLs are generated for image previews and cannot use the Next.js image optimizer. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";
import type { ApiResponse, Category, ImageUploadResponse, ProductRequest } from "@/src/lib/products";

const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 5 * 1024 * 1024;
const maxImages = 5;

type ImagePreview = { id: string; file: File; url: string };

export function CreateProductForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrls = useRef(new Set<string>());
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesState, setCategoriesState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories");
        const data = (await response.json()) as ApiResponse<Category[]> | { message?: string };
        if (!response.ok || !("payload" in data)) throw new Error(data.message ?? "Unable to load categories.");
        setCategories(data.payload);
        setCategoriesState("ready");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load categories.");
        setCategoriesState("error");
      }
    }

    void loadCategories();
  }, []);

  useEffect(() => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function addImages(files: FileList | File[]) {
    const remaining = maxImages - images.length;
    const validFiles = Array.from(files).filter((file) => acceptedImageTypes.has(file.type) && file.size <= maxImageBytes).slice(0, remaining);
    if (!validFiles.length) {
      setError(`Choose up to ${maxImages} JPG, PNG, or WEBP images no larger than 5MB.`);
      return;
    }

    const additions = validFiles.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      return { id: crypto.randomUUID(), file, url };
    });
    setImages((current) => [...current, ...additions]);
    setPrimaryImageId((current) => current ?? additions[0].id);
    setError(null);
  }

  function removeImage(image: ImagePreview) {
    URL.revokeObjectURL(image.url);
    objectUrls.current.delete(image.url);
    setImages((current) => {
      const next = current.filter(({ id }) => id !== image.id);
      setPrimaryImageId((primary) => primary === image.id ? next[0]?.id ?? null : primary);
      return next;
    });
  }

  const isValid = productName.trim() && description.trim() && Number(price) > 0 && categoryId && quantity !== "" && Number(quantity) >= 0 && primaryImageId && !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const primaryImage = images.find((image) => image.id === primaryImageId);
    if (!isValid || !primaryImage) {
      setError("Complete all required fields and select a primary image.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const uploadData = new FormData();
      uploadData.append("file", primaryImage.file);
      const uploadResponse = await fetch("/api/products/uploads", { method: "POST", body: uploadData });
      const uploadResult = (await uploadResponse.json()) as ApiResponse<ImageUploadResponse> | { message?: string };
      if (!uploadResponse.ok || !("payload" in uploadResult)) throw new Error(uploadResult.message ?? "Unable to upload the primary image.");

      const product: ProductRequest = {
        productName: productName.trim(),
        description: description.trim(),
        price: Number(price),
        discount: 0,
        specialPrice: Number(price),
        quantity: Number(quantity),
        categoryId: Number(categoryId),
        image: uploadResult.payload.imageUrl,
      };
      const createResponse = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const createResult = (await createResponse.json()) as ApiResponse<unknown> | { message?: string };
      if (!createResponse.ok) throw new Error(createResult.message ?? "Unable to create the product.");

      addToast({ title: "Product created successfully", color: "success", severity: "success", variant: "solid", timeout: 4000 });
      router.push("/admin/products");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to create the product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <main className="min-h-screen bg-[#f8f8f6] px-5 py-8 text-[#172033] sm:px-8 lg:px-10"><div className="mx-auto max-w-5xl"><nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb"><Link className="hover:text-[#4f46d9]" href="/admin">Admin Dashboard</Link><span>›</span><Link className="hover:text-[#4f46d9]" href="/admin/products">Products</Link><span>›</span><span className="font-semibold text-slate-700">Create Product</span></nav><div className="mt-6 flex flex-col gap-3 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#5c56d3]">Catalog management</p><h1 className="mt-2 font-[Georgia,serif] text-4xl font-semibold tracking-[-.055em]">Create Product</h1><p className="mt-2 text-sm text-slate-500">Add a new product to your store.</p></div><Link className="text-sm font-semibold text-[#4f46d9] hover:text-[#322ba9]" href="/admin/products">Cancel</Link></div><form className="mt-8 grid gap-6" onSubmit={handleSubmit}><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_25px_rgba(23,32,51,.05)] sm:p-7"><h2 className="font-[Georgia,serif] text-2xl font-semibold">Product Information</h2><div className="mt-6 grid gap-5"><label className="grid gap-2 text-sm font-semibold text-slate-700">Product Name *<input className="rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none transition focus:border-[#4f46d9] focus:ring-3 focus:ring-[#e8e7ff]" value={productName} onChange={(event) => setProductName(event.target.value)} required /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Description *<textarea className="min-h-32 rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none transition focus:border-[#4f46d9] focus:ring-3 focus:ring-[#e8e7ff]" value={description} onChange={(event) => setDescription(event.target.value)} required /></label><div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold text-slate-700">Price *<input className="rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none transition focus:border-[#4f46d9] focus:ring-3 focus:ring-[#e8e7ff]" min="0.01" step="0.01" type="number" value={price} onChange={(event) => setPrice(event.target.value)} required /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Stock Quantity *<input className="rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none transition focus:border-[#4f46d9] focus:ring-3 focus:ring-[#e8e7ff]" min="0" step="1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label></div><label className="grid gap-2 text-sm font-semibold text-slate-700">Category *<select className="rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-normal outline-none transition focus:border-[#4f46d9] focus:ring-3 focus:ring-[#e8e7ff]" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={categoriesState !== "ready" || categories.length === 0} required><option value="">{categoriesState === "loading" ? "Loading categories…" : categoriesState === "error" ? "Unable to load categories" : categories.length === 0 ? "No categories available" : "Select category"}</option>{categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>)}</select></label></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_25px_rgba(23,32,51,.05)] sm:p-7"><div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-[Georgia,serif] text-2xl font-semibold">Product Images *</h2><p className="mt-1 text-sm text-slate-500">Choose up to 5 images. Only the Primary image is saved to the product for now.</p></div><span className="text-xs font-semibold text-slate-500">{images.length}/{maxImages}</span></div><div className={`mt-6 grid min-h-48 place-items-center rounded-2xl border-2 border-dashed p-6 text-center transition ${isDragging ? "border-[#4f46d9] bg-[#f0efff]" : "border-slate-300 bg-slate-50"}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); addImages(event.dataTransfer.files); }}><div><p className="font-semibold text-slate-700">Drag images here</p><p className="mt-1 text-sm text-slate-500">or</p><button className="mt-4 rounded-xl border border-[#4f46d9] px-4 py-2 text-sm font-bold text-[#433bc8] transition hover:bg-[#f0efff]" type="button" onClick={() => inputRef.current?.click()}>Browse Files</button><p className="mt-4 text-xs text-slate-500">JPG, PNG, WEBP · Max 5MB each</p></div><input ref={inputRef} className="sr-only" accept="image/jpeg,image/png,image/webp" multiple type="file" onChange={(event) => { if (event.target.files) addImages(event.target.files); event.target.value = ""; }} /></div>{images.length > 0 && <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{images.map((image) => <div className={`relative overflow-hidden rounded-xl border bg-white p-2 ${image.id === primaryImageId ? "border-[#4f46d9] ring-2 ring-[#e4e2ff]" : "border-slate-200"}`} key={image.id}><img className="aspect-square w-full rounded-lg object-cover" src={image.url} alt="Selected product preview" /><button className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-slate-900/75 text-sm font-bold text-white hover:bg-slate-900" type="button" onClick={() => removeImage(image)} aria-label={`Remove ${image.file.name}`}>×</button><button className={`mt-2 w-full rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide ${image.id === primaryImageId ? "bg-[#4f46d9] text-white" : "bg-slate-100 text-slate-600 hover:bg-[#e9e8ff]"}`} type="button" onClick={() => setPrimaryImageId(image.id)}>{image.id === primaryImageId ? "Primary" : "Make primary"}</button></div>)}</div>}</section>{error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}<div className="flex flex-wrap justify-end gap-3"><Link className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-white" href="/admin/products">Cancel</Link><button className="rounded-xl bg-[#4f46d9] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(79,70,217,.24)] transition hover:bg-[#4038c8] disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={!isValid}>{isSubmitting ? "Creating Product…" : "Create Product"}</button></div></form></div></main>;
}
