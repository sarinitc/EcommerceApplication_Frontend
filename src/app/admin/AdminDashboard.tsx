"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingBag, ShoppingCart, Users } from "lucide-react";
import { Header } from "./Header";
import { OrdersStatusChart } from "./OrdersStatusChart";
import { RecentOrdersTable } from "./RecentOrdersTable";
import { SalesChart } from "./SalesChart";
import { Sidebar } from "./Sidebar";
import { StatCard } from "./StatCard";
import { TopProductsList } from "./TopProductsList";
import type { DashboardOverview, OrderStatus, RecentOrder, SalesOverview, TopProduct } from "@/src/lib/dashboard";

type DashboardResponse = { payload: DashboardOverview; message?: string };

const demoSales: SalesOverview[] = [{ date: "01 May", orders: 18, revenue: 2200 }, { date: "04 May", orders: 25, revenue: 2800 }, { date: "07 May", orders: 19, revenue: 2400 }, { date: "10 May", orders: 31, revenue: 3400 }, { date: "13 May", orders: 27, revenue: 3100 }, { date: "16 May", orders: 38, revenue: 4100 }, { date: "19 May", orders: 32, revenue: 3600 }, { date: "22 May", orders: 42, revenue: 4500 }, { date: "26 May", orders: 36, revenue: 4000 }, { date: "30 May", orders: 48, revenue: 4900 }];
const demoStatuses: OrderStatus[] = [{ status: "PENDING", count: 16 }, { status: "PROCESSING", count: 64 }, { status: "SHIPPED", count: 120 }, { status: "DELIVERED", count: 32 }, { status: "CANCELLED", count: 8 }];
const demoOrders: RecentOrder[] = [{ orderId: 2451, customerName: "John Doe", email: "john@example.com", orderDate: "2026-05-30", total: 120, status: "PENDING" }, { orderId: 2450, customerName: "Jane Smith", email: "jane@example.com", orderDate: "2026-05-30", total: 75.5, status: "PROCESSING" }, { orderId: 2449, customerName: "Robert Johnson", email: "robert@example.com", orderDate: "2026-05-29", total: 210, status: "SHIPPED" }, { orderId: 2448, customerName: "Emily Davis", email: "emily@example.com", orderDate: "2026-05-29", total: 65, status: "DELIVERED" }];
const demoTopProducts: TopProduct[] = [{ productId: 1, productName: "Wireless Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80", unitsSold: 125 }, { productId: 2, productName: "Smart Watch", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80", unitsSold: 98 }, { productId: 3, productName: "Running Shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80", unitsSold: 76 }, { productId: 4, productName: "Backpack", image: "https://images.unsplash.com/photo-1553062407-2?auto=format&fit=crop&w=100&q=80", unitsSold: 56 }];

export function AdminDashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOverview() {
      try {
        const response = await fetch("/api/admin/dashboard/overview", { signal: controller.signal });
        const data = await response.json() as DashboardResponse | { message?: string };
        if (!response.ok || !("payload" in data)) throw new Error(data.message ?? "Unable to load dashboard data.");
        setOverview(data.payload);
      } catch (loadError) {
        if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
      }
    }

    void loadOverview();
    return () => controller.abort();
  }, []);

  return <div className="flex min-w-295 bg-[#f8f9fb] font-sans"><Sidebar /><div className="min-h-screen flex-1"><Header /><main className="space-y-6 p-6">{error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}{!overview && !error ? <p className="text-sm text-slate-500">Loading dashboard data…</p> : overview && <><div className="grid grid-cols-4 gap-4"><StatCard icon={ShoppingBag} iconBg="bg-indigo-50 text-indigo-600" label="Total Products" value={String(overview.summary.totalProducts)} /><StatCard icon={Users} iconBg="bg-emerald-50 text-emerald-600" label="Total Customers" value={String(overview.summary.totalCustomers)} /><StatCard icon={ShoppingCart} iconBg="bg-blue-50 text-blue-600" label="Total Orders" value={String(overview.summary.totalOrders)} /><StatCard icon={Package} iconBg="bg-orange-50 text-orange-500" label="Pending Orders" value={String(overview.summary.pendingOrders)} /></div><div className="grid grid-cols-3 gap-4"><div className="col-span-2"><SalesChart sales={overview.sales.length ? overview.sales : demoSales} /></div><OrdersStatusChart statuses={overview.ordersByStatus.length ? overview.ordersByStatus : demoStatuses} /></div><div className="grid grid-cols-3 gap-4"><div className="col-span-2"><RecentOrdersTable orders={overview.recentOrders.length ? overview.recentOrders : demoOrders} /></div><TopProductsList products={overview.topProducts.length ? overview.topProducts : demoTopProducts} /></div></>}</main><footer className="py-4 text-center text-sm text-gray-400">© 2026 IndigoStore. All rights reserved.</footer></div></div>;
}
