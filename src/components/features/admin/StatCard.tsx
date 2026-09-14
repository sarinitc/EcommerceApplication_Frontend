import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

type StatCardProps = { icon: LucideIcon; iconBg: string; label: string; value: string; change?: string; trend?: "up" | "down" };

export function StatCard({ icon: Icon, iconBg, label, value, change, trend }: StatCardProps) {
  const isUp = trend === "up";
  return <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><div className={`grid h-11 w-11 place-items-center rounded-lg ${iconBg}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-slate-800">{value}</p>{change && <p className="mt-3 flex items-center gap-1 text-xs"><span className={`inline-flex items-center font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>{isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{change}</span><span className="text-slate-400">this month</span></p>}</article>;
}
