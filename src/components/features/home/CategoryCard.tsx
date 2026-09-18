"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import {
  ArrowUpRight,
  Brush,
  Dumbbell,
  Footprints,
  Headphones,
  Laptop,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sofa,
  Sparkles,
  Tv,
  Watch,
  type LucideIcon,
} from "lucide-react";
import styles from "@/app/page.module.css";

export type HomeCategory = {
  categoryId: number | string;
  categoryName: string;
  image?: string;
  productCount?: number;
};

const categoryArtwork: { names: string[]; image: string }[] = [
  { names: ["accessories"], image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80" },
  { names: ["laptops", "computer macbook"], image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
  { names: ["smartphones"], image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
  { names: ["electronics"], image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=900&q=80" },
  { names: ["televisions"], image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80" },
  { names: ["men fashion"], image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=80" },
  { names: ["women fashion"], image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80" },
  { names: ["shoes", "sports"], image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80" },
  { names: ["books"], image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80" },
  { names: ["home appliances"], image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80" },
];

const categoryIcons: { match: string[]; icon: LucideIcon }[] = [
  { match: ["laptop", "computer", "tech", "electron", "digital", "monitor"], icon: Laptop },
  { match: ["phone", "mobile", "smart", "tablet"], icon: Smartphone },
  { match: ["television", "tv", "video", "screen"], icon: Tv },
  { match: ["fashion", "apparel", "clothing", "shirt", "men", "women", "dress", "suit"], icon: Shirt },
  { match: ["shoe", "footwear", "sneaker", "running"], icon: Footprints },
  { match: ["beauty", "cosmetic", "makeup", "skincare", "spa", "perfume", "care"], icon: Sparkles },
  { match: ["home", "living", "furniture", "sofa", "bed", "decor"], icon: Sofa },
  { match: ["accessor", "jewel", "watch", "bag"], icon: Watch },
  { match: ["audio", "headphone", "sound", "speaker", "music"], icon: Headphones },
  { match: ["sport", "fitness", "gym", "athletic", "outdoor", "active"], icon: Dumbbell },
  { match: ["book", "stationery", "office", "desk", "craft", "art"], icon: Brush },
];

const fallbackIcon: LucideIcon = ShoppingBag;

export function categoryImageFor(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  return categoryArtwork.find((entry) => entry.names.includes(key))?.image;
}

export function categoryIconFor(name: string): ReactElement {
  const key = name.toLowerCase();
  const Icon = categoryIcons.find((entry) => entry.match.some((token) => key.includes(token)))?.icon ?? fallbackIcon;
  return <Icon strokeWidth={1.6} />;
}

export function CategoryCard({ category }: { category: HomeCategory }) {
  const image = category.image?.trim() || categoryImageFor(category.categoryName);
  const icon = image ? null : categoryIconFor(category.categoryName);
  const className = image
    ? styles.categoryCard
    : `${styles.categoryCard} ${styles.categoryCardFallback}`;

  return (
    <Link
      className={className}
      href={`/products?category=${encodeURIComponent(category.categoryName)}`}
      aria-label={`Browse ${category.categoryName}`}
    >
      <div className={styles.categoryMedia}>
        {image ? (
          <img
            className={styles.categoryImage}
            src={image}
            alt={`${category.categoryName} collection`}
            loading="lazy"
          />
        ) : (
          <div className={styles.categoryFallback}>
            <span className={styles.categoryFallbackIcon} aria-hidden="true">
              {icon}
            </span>
          </div>
        )}
        <div className={styles.categoryShade} />
      </div>

      <div className={styles.categoryContent}>
        <div className={styles.categoryInfo}>
          <h3 className={styles.categoryName}>{category.categoryName}</h3>
          {typeof category.productCount === "number" && (
            <p className={styles.categoryMeta}>{category.productCount} products</p>
          )}
        </div>
        <span className={styles.categoryArrow} aria-hidden="true">
          <ArrowUpRight />
        </span>
      </div>
    </Link>
  );
}