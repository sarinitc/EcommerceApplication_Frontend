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

const categoryArtwork: { match: string[]; image: string }[] = [
  { match: ["electronic", "laptop", "computer", "phone", "smart", "mobile", "tablet", "television", "tv", "monitor", "audio", "headphone", "sound", "tech", "gaming", "camera"], image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80" },
  { match: ["fashion", "apparel", "clothing", "shirt", "men", "women", "dress", "suit"], image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80" },
  { match: ["home", "living", "furniture", "sofa", "bed", "lighting", "lamp", "light", "decor", "kitchen", "garden"], image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80" },
  { match: ["accessor", "jewel", "watch", "bag", "handbag", "sunglass"], image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80" },
  { match: ["shoe", "footwear", "sneaker", "sport", "sports", "fitness", "athletic", "outdoor", "active", "gym", "running"], image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80" },
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
  const key = name.toLowerCase();
  return categoryArtwork.find((entry) => entry.match.some((token) => key.includes(token)))?.image;
}

export function categoryIconFor(name: string): ReactElement {
  const key = name.toLowerCase();
  const Icon = categoryIcons.find((entry) => entry.match.some((token) => key.includes(token)))?.icon ?? fallbackIcon;
  return <Icon strokeWidth={1.6} />;
}

export function CategoryCard({ category }: { category: HomeCategory }) {
  const image = category.image?.trim() ? category.image : categoryImageFor(category.categoryName);
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