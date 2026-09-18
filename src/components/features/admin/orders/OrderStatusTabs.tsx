import { ORDER_STATUSES, type OrderStatusKey } from "./orders-data";

export function OrderStatusTabs({ counts, active, onChange, disabled }: {
  counts: Record<OrderStatusKey, number>;
  active: OrderStatusKey | "ALL";
  onChange: (status: OrderStatusKey | "ALL") => void;
  disabled?: boolean;
}) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const tab = (label: string, value: OrderStatusKey | "ALL", count: number) => (
    <button
      key={value}
      type="button"
      onClick={() => { if (!disabled) onChange(value); }}
      disabled={disabled}
      aria-pressed={active === value}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${active === value ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${active === value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>{count}</span>
    </button>
  );

  return (
    <div role="tablist" aria-label="Filter orders by status" className="flex items-center gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-sm">
      {tab("All", "ALL", total)}
      {ORDER_STATUSES.map((status) => tab(status.charAt(0) + status.slice(1).toLowerCase(), status, counts[status]))}
    </div>
  );
}