"use client";

import { useEffect, useState } from "react";
import { DollarSign, Repeat, UserPlus, Users } from "lucide-react";

export function CustomerStatsCards({ refreshKey }: { refreshKey: number }) {
  const [result, setResult] = useState<{ key: number; total?: number; error?: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadTotal() {
      try {
        // Keep the overall count independent of table search and pagination.
        const response = await fetch("/api/admin/customers?page=0&size=1", {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok || data?.success === false) {
          throw new Error(data?.message || "Unable to load customer statistics.");
        }
        const total: unknown = data?.payload?.totalElements;
        if (typeof total !== "number" || !Number.isSafeInteger(total) || total < 0) {
          throw new Error("The customer count is unavailable.");
        }
        if (!controller.signal.aborted) setResult({ key: refreshKey, total });
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({ key: refreshKey, error: error instanceof Error ? error.message : "Unable to load customer statistics." });
        }
      }
    }
    void loadTotal();
    return () => controller.abort();
  }, [refreshKey]);

  const current = result?.key === refreshKey ? result : null;
  const cards = [
    { label: "Total Customers", value: current ? current.total?.toLocaleString() ?? "—" : "…", detail: current?.error ?? (current ? "All customers" : "Loading…"), icon: Users, color: "bg-violet-100 text-violet-600" },
    { label: "New This Month", value: "—", detail: "Not available yet", icon: UserPlus, color: "bg-emerald-100 text-emerald-600" },
    { label: "Repeat Customers", value: "—", detail: "Not available yet", icon: Repeat, color: "bg-sky-100 text-sky-600" },
    { label: "Avg. Order Value", value: "—", detail: "Not available yet", icon: DollarSign, color: "bg-orange-100 text-orange-600" },
  ];

  return <section className="grid grid-cols-4 gap-4" aria-label="Customer statistics" aria-live="polite">
    {cards.map(({ label, value, detail, icon: Icon, color }) => <article key={label} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <span className={`grid h-11 w-11 place-items-center rounded-lg ${color}`}><Icon className="h-5 w-5" /></span>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </article>)}
  </section>;
}
