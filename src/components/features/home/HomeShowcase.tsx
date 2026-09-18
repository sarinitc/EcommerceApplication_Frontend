"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ApiResponse, Product, ProductPage } from "@/types/product";
import { CategoryCard, type HomeCategory } from "./CategoryCard";
import styles from "@/app/page.module.css";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function readCategories(data: unknown): HomeCategory[] {
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
    const image = typeof value.image === "string" && value.image.trim() ? value.image.trim()
      : typeof value.categoryImage === "string" && value.categoryImage.trim() ? value.categoryImage.trim() : undefined;
    const productCount = typeof value.productCount === "number" ? value.productCount
      : typeof value.count === "number" ? value.count : undefined;
    return [{ categoryId: id, categoryName: name, image, productCount }];
  });
}

function readProducts(data: unknown): Product[] {
  const payload = (data as ApiResponse<ProductPage> | null)?.payload;
  return Array.isArray(payload?.content) ? payload.content : [];
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

export function HomeShowcase() {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [picks, setPicks] = useState<Product[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch("/api/categories", { signal: controller.signal, cache: "no-store" }),
          fetch("/api/products?page=0&size=8", { signal: controller.signal, cache: "no-store" }),
        ]);

        if (categoryResponse.ok) {
          const loaded = readCategories(await categoryResponse.json().catch(() => null));
          if (loaded.length) setCategories(loaded);
        }
        if (productResponse.ok) {
          const loaded = readProducts(await productResponse.json().catch(() => null));
          if (loaded.length) setPicks(loaded.slice(0, 4));
        }
      } catch {
        setCategories([]);
        setPicks([]);
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return (
    <>
      {categories.length > 0 && <section id="collections" className={`${styles.container} ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2>Shop by category</h2>
          <div className={styles.sectionMeta}>
            <p className={styles.sectionDescription}>Discover products made for your everyday life.</p>
            <Link className={styles.sectionLink} href="/products">View all products <Arrow /></Link>
          </div>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <CategoryCard key={category.categoryId} category={category} />
          ))}
        </div>
      </section>}

      {picks.length > 0 && <section className={styles.picksSection}>
        <div className={`${styles.container} ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Handpicked for you</p>
              <h2>This week&apos;s picks</h2>
            </div>
            <div className={styles.sectionMeta}>
              <p className={styles.sectionDescription}>A small curation of the pieces our customers keep coming back to.</p>
              <Link className={styles.sectionLink} href="/products">See all <Arrow /></Link>
            </div>
          </div>
          <div className={styles.productGrid}>
            {picks.map((product) => {
              const price = product.specialPrice > 0 ? product.specialPrice : product.price;
              const onSale = product.specialPrice > 0 && product.specialPrice < product.price;
              return (
                <article className={styles.productCard} key={product.productId}>
                  <Link href={`/products/${product.productId}`} className={styles.productImage} aria-label={product.productName}>
                    {product.image && <span style={{ backgroundImage: `url(${product.image})` }} />}
                    {product.discount > 0 && <small className={styles.productTag}>-{product.discount}%</small>}
                  </Link>
                  <div className={styles.productInfo}>
                    <p className={styles.productCategory}>{product.category?.categoryName ?? "Uncategorized"}</p>
                    <h3><Link href={`/products/${product.productId}`}>{product.productName}</Link></h3>
                    <p className={styles.price}>
                      <span>{currency.format(price)}</span>
                      {onSale && <del>{currency.format(product.price)}</del>}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>}
    </>
  );
}