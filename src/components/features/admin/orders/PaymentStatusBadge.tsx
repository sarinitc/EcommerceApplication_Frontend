import { CheckCircle2, Clock, XCircle, RotateCcw } from "lucide-react";
import type { PaymentStatusKey } from "./orders-data";

const badge: Record<PaymentStatusKey, { className: string; icon: typeof CheckCircle2 }> = {
  PAID: { className: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  PENDING: { className: "bg-amber-50 text-amber-700", icon: Clock },
  FAILED: { className: "bg-red-50 text-red-700", icon: XCircle },
  REFUNDED: { className: "bg-slate-100 text-slate-600", icon: RotateCcw },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatusKey }) {
  const { className, icon: Icon } = badge[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}