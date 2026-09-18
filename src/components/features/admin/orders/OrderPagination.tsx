import { ChevronLeft, ChevronRight } from "lucide-react";

function pageWindow(current: number, total: number) {
  const max = Math.min(7, total);
  const start = Math.max(0, Math.min(current - 3, total - max));
  return Array.from({ length: max }, (_, index) => start + index);
}

export function OrderPagination({ page, pageSize, total, onPage, onPageSize }: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onPageSize: (pageSize: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total ? page * pageSize + 1 : 0;
  const end = Math.min((page + 1) * pageSize, total);
  const windowStart = pageWindow(page, pages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-5 py-3 shadow-sm">
      <p className="text-sm text-slate-500">
        Showing <b className="font-semibold text-slate-700 tabular-nums">{start}–{end}</b> of <b className="font-semibold text-slate-700 tabular-nums">{total}</b> orders
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-500">
          Rows per page
          <select value={pageSize} onChange={(event) => onPageSize(Number(event.target.value))} aria-label="Rows per page" className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
        <button aria-label="Previous page" disabled={page === 0} onClick={() => onPage(page - 1)} className="rounded-md border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        {windowStart.map((number) => (
          <button key={number} aria-current={number === page ? "page" : undefined} onClick={() => onPage(number)} className={`h-8 w-8 rounded-md text-xs transition-colors ${number === page ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}>
            {number + 1}
          </button>
        ))}
        <button aria-label="Next page" disabled={page >= pages - 1} onClick={() => onPage(page + 1)} className="rounded-md border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}