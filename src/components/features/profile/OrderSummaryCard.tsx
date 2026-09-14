"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronDown, ChevronRight, CircleCheck, Package, TrendingUp, Truck } from "lucide-react";

const orderPeriods = {
  "30": { total: 24, transit: 2, delivered: 20, growth: "+12%", comparison: "from last month" },
  "90": { total: 68, transit: 4, delivered: 62, growth: "+18%", comparison: "from last quarter" },
  all: { total: 126, transit: 2, delivered: 120, growth: "126", comparison: "orders placed" },
};

export function OrderSummaryCard() {
  const [period, setPeriod] = useState<keyof typeof orderPeriods>("30");
  const stats = orderPeriods[period];
  const cards = [
    {
      label: "Total Orders",
      value: stats.total,
      icon: Package,
      surface: "border-indigo-100/80 bg-[#f8faff]",
      color: "bg-indigo-100/60 text-[#6366f1]",
      wave: "text-blue-100/40",
      detail: <><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-500"><TrendingUp size={15} /></span><span><span className="text-emerald-600">{stats.growth}</span> {stats.comparison}</span></>,
    },
    {
      label: "In Transit",
      value: stats.transit,
      icon: Truck,
      surface: "border-amber-100/80 bg-[#fffdf9]",
      color: "bg-amber-100/60 text-orange-500",
      wave: "text-orange-100/30",
      detail: <><span className="size-2.5 shrink-0 rounded-full bg-amber-400 ring-4 ring-amber-50" />On the way</>,
    },
    {
      label: "Delivered",
      value: stats.delivered,
      icon: CircleCheck,
      surface: "border-emerald-100/80 bg-[#f7fdfa]",
      color: "bg-emerald-100/70 text-emerald-600",
      wave: "text-emerald-100/30",
      detail: <><span className="size-2.5 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />Successfully delivered</>,
    },
  ];

  return (
    <section className="rounded-2xl border border-[#e6eafa] bg-white/95 p-5 shadow-[0_6px_24px_-16px_rgba(71,85,150,0.18)] sm:p-7" aria-labelledby="order-title">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-[#6366f1]">SHOPPING</p>
          <h2 id="order-title" className="mt-1 text-2xl font-bold tracking-tight text-[#11143d] sm:text-[28px]">Order Summary</h2>
        </div>
        <label className="relative flex shrink-0 items-center rounded-xl border border-[#e4e7f3] bg-white text-[#565f88] transition-all duration-150 hover:bg-indigo-50/40 focus-within:ring-2 focus-within:ring-indigo-200">
          <CalendarDays size={18} className="pointer-events-none absolute left-3.5" aria-hidden="true" />
          <span className="sr-only">Order summary period</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value as keyof typeof orderPeriods)} className="cursor-pointer appearance-none rounded-xl bg-transparent py-3 pr-9 pl-11 text-[13px] outline-none">
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3" aria-hidden="true" />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-5" aria-live="polite" aria-atomic="true">
        {cards.map(({ label, value, icon: Icon, surface, color, wave, detail }) => (
          <div key={label} className={`relative isolate overflow-hidden rounded-xl border p-3 transition-all duration-150 sm:p-5 xl:p-6 ${surface}`}>
            <svg viewBox="0 0 300 180" preserveAspectRatio="none" className={`pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-4/5 w-full ${wave}`} aria-hidden="true">
              <path d="M0 122C53 144 91 126 131 88C173 48 192 70 229 35C253 12 278 1 300 0V180H0Z" fill="currentColor" />
              <path d="M0 163C66 157 111 166 155 130C211 85 250 120 300 55V180H0Z" fill="currentColor" opacity="0.45" />
            </svg>
            <span className={`mb-3 flex size-10 items-center justify-center rounded-2xl sm:size-12 ${color}`}><Icon size={25} strokeWidth={1.8} aria-hidden="true" /></span>
            <strong className="block text-[28px] leading-tight font-bold tracking-tight text-[#10133d] sm:text-[32px]">{value}</strong>
            <span className="mt-1 block text-xs text-[#657095] sm:text-sm">{label}</span>
            <div className="mt-3 flex min-h-6 flex-wrap items-center gap-2 text-[10px] leading-4 text-[#677498] sm:text-[11px] xl:text-xs">{detail}</div>
          </div>
        ))}
      </div>

      <Link href="/account/orders" className="group mt-5 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#e5e8f4] bg-[#fdfdff] px-4 py-4 transition-all duration-150 hover:border-indigo-200 hover:bg-indigo-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:px-6">
        <span className="flex items-center gap-3 text-sm font-semibold text-[#15183f] group-hover:underline group-hover:underline-offset-4">View All Orders <ArrowRight size={20} className="text-[#6366f1] transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" /></span>
        <span className="flex items-center gap-3 text-xs text-[#7a83a5]"><span className="hidden sm:inline">Track, return, or buy again</span><ChevronRight size={17} aria-hidden="true" /></span>
      </Link>
    </section>
  );
}
