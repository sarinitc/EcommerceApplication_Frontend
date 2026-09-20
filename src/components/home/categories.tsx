import type { ReactElement } from "react";
import {
  BookOpen,
  Dumbbell,
  Footprints,
  Headphones,
  Laptop,
  LayoutGrid,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sofa,
  Sparkles,
  Tv,
  Watch,
  type LucideIcon,
} from "lucide-react";

export type HomeCategory = {
  categoryId: number | string;
  categoryName: string;
  image?: string;
  productCount?: number;
};

const categoryIcons: { match: string[]; icon: LucideIcon }[] = [
  { match: ["laptop", "computer", "tech", "electron", "digital", "monitor", "notebook"], icon: Laptop },
  { match: ["phone", "mobile", "smart", "tablet", "wearable"], icon: Smartphone },
  { match: ["television", "tv", "video", "screen", "gaming", "console"], icon: Tv },
  { match: ["fashion", "apparel", "clothing", "shirt", "men", "women", "dress", "suit", "jewel"], icon: Shirt },
  { match: ["shoe", "footwear", "sneaker", "running"], icon: Footprints },
  { match: ["beauty", "cosmetic", "makeup", "skincare", "spa", "perfume", "care"], icon: Sparkles },
  { match: ["home", "living", "furniture", "sofa", "bed", "decor", "appliance", "kitchen", "interior"], icon: Sofa },
  { match: ["accessor", "watch", "bag", "handbag"], icon: Watch },
  { match: ["audio", "headphone", "sound", "speaker", "music", "earbuds"], icon: Headphones },
  { match: ["sport", "fitness", "gym", "athletic", "outdoor", "active"], icon: Dumbbell },
  { match: ["book", "stationery", "office", "desk", "craft", "art", "camera", "photograph"], icon: BookOpen },
];

const fallbackIcon: LucideIcon = ShoppingBag;

export function categoryIconFor(name: string): ReactElement {
  const key = name.toLowerCase();
  const Icon = categoryIcons.find((entry) => entry.match.some((token) => key.includes(token)))?.icon ?? fallbackIcon;
  return <Icon strokeWidth={1.6} className="h-4.5 w-4.5" />;
}

export function categoryChipIconFor(name: string): ReactElement {
  if (name === "All") return <LayoutGrid strokeWidth={1.8} className="h-4 w-4" />;
  return categoryIconFor(name);
}

export type BentoSlots =
  | { variant: "large"; className: string }
  | { variant: "medium"; className: string }
  | { variant: "small"; className: string };

export function bentoSizes(count: number): BentoSlots[] {
  const slots: BentoSlots[] = [];
  for (let index = 0; index < count; index += 1) {
    if (index === 0) {
      slots.push({ variant: "large", className: "col-span-2 row-span-2" });
    } else if (index <= 2) {
      slots.push({ variant: "medium", className: "" });
    } else {
      slots.push({ variant: "small", className: "" });
    }
  }
  return slots;
}

export function uniqueCategoryImages(categories: HomeCategory[]): Map<number | string, string | undefined> {
  const assignments = new Map<number | string, string | undefined>();

  for (const category of categories) {
    assignments.set(category.categoryId, category.image?.trim() || undefined);
  }
  return assignments;
}