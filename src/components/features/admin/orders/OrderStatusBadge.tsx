import type { OrderStatusKey } from "./orders-data";

const badgeStyles: Record<OrderStatusKey, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const dotStyles: Record<OrderStatusKey, string> = {
  PENDING: "bg-amber-500",
  PROCESSING: "bg-blue-500",
  SHIPPED: "bg-indigo-500",
  DELIVERED: "bg-emerald-500",
  CANCELLED: "bg-red-500",
};

export function OrderStatusBadge({ status }: { status: OrderStatusKey }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${badgeStyles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status]}`} aria-hidden="true" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}