import { Plus, RotateCcw, ShoppingBag } from "lucide-react";

export function OrderEmptyState({ hasActiveFilters, onClearFilters, onCreate }: { hasActiveFilters: boolean; onClearFilters: () => void; onCreate: () => void }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-500">
        <ShoppingBag className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-bold text-slate-800">{hasActiveFilters ? "No orders match your filters." : "No orders yet"}</h2>
      <p className="mt-1 text-sm text-slate-500">{hasActiveFilters ? "Try adjusting your search or filter criteria." : "Customer orders will appear here once purchases are made."}</p>
      <div className="mt-6">
        {hasActiveFilters ? (
          <button type="button" onClick={onClearFilters} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />Clear filters
          </button>
        ) : (
          <button type="button" onClick={onCreate} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
            <Plus className="h-4 w-4" aria-hidden="true" />Create Order
          </button>
        )}
      </div>
    </div>
  );
}