import { CalendarDays, ChevronDown, RotateCcw, Search } from "lucide-react";
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatusKey, type PaymentStatusKey } from "./orders-data";

export type OrderFiltersState = {
  search: string;
  status: OrderStatusKey | "ALL";
  payment: PaymentStatusKey | "ALL";
  dateFrom: string;
  dateTo: string;
};

export const emptyFilters: OrderFiltersState = { search: "", status: "ALL", payment: "ALL", dateFrom: "", dateTo: "" };

const selectClass = "h-10 appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export function OrderFilters({ filters, onChange, onReset, results }: {
  filters: OrderFiltersState;
  onChange: (filters: OrderFiltersState) => void;
  onReset: () => void;
  results: number;
}) {
  const hasFilters = Boolean(filters.search.trim() || filters.status !== "ALL" || filters.payment !== "ALL" || filters.dateFrom || filters.dateTo);

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <label className="flex h-10 min-w-60 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-400 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 xl:max-w-96">
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">Search orders</span>
            <input
              value={filters.search}
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
              placeholder="Search order ID, customer, email..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="relative">
            <span className="sr-only">Filter by order status</span>
            <select value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value as OrderStatusKey | "ALL" })} className={selectClass}>
              <option value="ALL">All statuses</option>
              {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          </label>

          <label className="relative">
            <span className="sr-only">Filter by payment status</span>
            <select value={filters.payment} onChange={(event) => onChange({ ...filters, payment: event.target.value as PaymentStatusKey | "ALL" })} className={selectClass}>
              <option value="ALL">All payments</option>
              {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          </label>

          <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-400">
            <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">From date</span>
            <input type="date" value={filters.dateFrom} onChange={(event) => onChange({ ...filters, dateFrom: event.target.value })} className="bg-transparent text-sm text-slate-600 outline-none" />
          </label>
          <span className="text-xs text-slate-400">to</span>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-400">
            <span className="sr-only">To date</span>
            <input type="date" value={filters.dateTo} onChange={(event) => onChange({ ...filters, dateTo: event.target.value })} className="bg-transparent text-sm text-slate-600 outline-none" />
          </label>

          {hasFilters && (
            <button type="button" onClick={onReset} className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>
        <span className="shrink-0 px-1 text-xs font-semibold text-slate-400">{results} result{results === 1 ? "" : "s"}</span>
      </div>
    </section>
  );
}