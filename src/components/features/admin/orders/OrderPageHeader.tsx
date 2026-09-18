import { Download, Plus } from "lucide-react";

export function OrderPageHeader({ total, onExport, onCreate }: { total: number; onExport: () => void; onCreate: () => void }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500">Order management</p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
        <p className="mt-1.5 text-sm text-slate-500">Manage and track customer orders.</p>
        <p className="mt-1 text-xs font-medium text-slate-400">{total} total orders</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export
        </button>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create Order
        </button>
      </div>
    </header>
  );
}