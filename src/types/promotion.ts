export type Promotion = {
  promotionId: number;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minimumOrderAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount?: number;
  active: boolean;
};

export type PromotionListResponse = {
  success?: boolean;
  message?: string;
  payload?: Promotion[];
  data?: Promotion[];
};
