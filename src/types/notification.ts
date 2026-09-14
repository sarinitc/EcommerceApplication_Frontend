export const NOTIFICATION_TYPES = [
  "COMMENT_ADDED",
  "ORDER_CREATED",
  "ORDER_UPDATED",
  "PROJECT_INVITATION",
  "MEMBER_ADDED",
  "PAYMENT_SUCCESS",
  "PRODUCT_CREATED",
  "PRODUCT_UPDATED",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: number;
  referenceType?: string;
  read: boolean;
  createdAt: string;
};

export type NotificationRequest = {
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: number;
  referenceType?: string;
  read?: boolean;
};