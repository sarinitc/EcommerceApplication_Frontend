"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { OrderStatus } from "@/src/lib/dashboard";

const colors = ["#f59e0b", "#3b82f6", "#6366f1", "#10b981", "#ef4444"];

export function OrdersStatusChart({ statuses }: { statuses: OrderStatus[] }) {
  const total = statuses.reduce((sum, status) => sum + status.count, 0);
  return <section className="h-[350px] rounded-xl border border-gray-100 bg-white p-6 shadow-sm"><h2 className="text-base font-bold text-slate-800">Orders by Status</h2><div className="mt-4 flex h-[262px] items-center"><div className="relative h-52 w-52 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statuses} dataKey="count" cx="50%" cy="50%" innerRadius={58} outerRadius={82} paddingAngle={3} stroke="none">{statuses.map((status, index) => <Cell key={status.status} fill={colors[index % colors.length]} />)}</Pie></PieChart></ResponsiveContainer><div className="absolute inset-0 grid place-content-center text-center"><b className="text-2xl text-slate-800">{total}</b><span className="text-xs text-slate-400">Orders</span></div></div><ul className="grid flex-1 gap-2.5 text-xs">{statuses.map((status, index) => <li className="flex items-center gap-2" key={status.status}><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} /><span className="flex-1 capitalize text-slate-500">{status.status.toLowerCase()}</span><b className="text-slate-700">{status.count}</b><span className="w-8 text-right text-slate-400">{total ? Math.round((status.count / total) * 100) : 0}%</span></li>)}</ul></div></section>;
}
