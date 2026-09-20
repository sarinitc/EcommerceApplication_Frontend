"use client";

import { useEffect, useState } from "react";
import type { ApiResponse, Product, ProductPage } from "@/types/product";
import type { HomeCategory } from "./categories";

export function readCategories(data: unknown): HomeCategory[] {
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  const payload = record.payload ?? data;
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { content?: unknown }).content)
      ? (payload as { content: unknown[] }).content
      : [];
  return list.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const value = item as Record<string, unknown>;
    const name = typeof value.categoryName === "string" ? value.categoryName : typeof value.name === "string" ? value.name : null;
    if (!name) return [];
    const id = typeof value.categoryId === "number" ? value.categoryId : typeof value.id === "number" ? value.id : name;
    const image = [value.image, value.imageUrl, value.imageURL, value.categoryImage, value.categoryImageUrl, value.categoryImageURL]
      .find((candidate): candidate is string => typeof candidate === "string" && candidate.trim().length > 0)
      ?.trim();
    const productCount = typeof value.productCount === "number" ? value.productCount
      : typeof value.count === "number" ? value.count : undefined;
    return [{ categoryId: id, categoryName: name, image, productCount }];
  });
}

export function readProducts(data: unknown): Product[] {
  const payload = (data as ApiResponse<ProductPage> | null)?.payload;
  return Array.isArray(payload?.content) ? payload.content : [];
}

export function useHomeData() {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch("/api/categories", { signal: controller.signal, cache: "no-store" }),
          fetch("/api/products?page=0&size=24", { signal: controller.signal, cache: "no-store" }),
        ]);

        const [categoryData, productData] = await Promise.all([
          categoryResponse.ok ? categoryResponse.json().catch(() => null) : null,
          productResponse.ok ? productResponse.json().catch(() => null) : null,
        ]);

        if (categoryData) {
          const loaded = readCategories(categoryData);
          if (loaded.length) setCategories(loaded);
        }
        if (productData) {
          const loaded = readProducts(productData);
          if (loaded.length) setProducts(loaded);
        }
      } catch {
        setCategories([]);
        setProducts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return { categories, products, loading };
}