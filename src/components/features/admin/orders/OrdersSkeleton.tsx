export function OrdersSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading orders">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-xl border border-gray-100 bg-white/80 p-5">
            <div className="h-10 w-10 rounded-xl bg-slate-100" />
            <div className="mt-4 h-3 w-1/2 rounded bg-slate-100" />
            <div className="mt-2 h-5 w-1/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="h-11 animate-pulse rounded-xl border border-gray-100 bg-white/80" />
      <div className="flex flex-wrap gap-3">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-white/80" />
        <div className="h-10 w-40 animate-pulse rounded-lg bg-white/80" />
        <div className="h-10 w-40 animate-pulse rounded-lg bg-white/80" />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-gray-100 bg-slate-50/70 px-4 py-3">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-3 w-20 animate-pulse rounded bg-slate-200" />)}
        </div>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-gray-100 px-4 py-4 last:border-0">
            <div className="h-4 w-4 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
            <div className="ml-auto h-6 w-20 animate-pulse rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}