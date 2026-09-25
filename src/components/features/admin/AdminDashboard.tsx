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
import type { DashboardOverview, OrderStatus, RecentOrder, SalesOverview, TopProduct } from "@/types/dashboard";

type DashboardResponse = { payload: DashboardOverview; message?: string };

type BackendOrder = {
  orderId?: number;
  email?: string;
  orderDate?: string;
  orderStatus?: string;
  totalAmount?: number;
  items?: Array<{ quantity?: number; orderedProductPrice?: number; product?: { productName?: string; productId?: number; image?: string } | null }>;
};

const VALID_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

function statusOf(value: string | undefined): string {
  return VALID_STATUSES.includes(value ?? "") ? (value as string) : "PENDING";
}

function buildStatuses(orders: BackendOrder[]): OrderStatus[] {
  const counts: Record<string, number> = { PENDING: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
  orders.forEach((order) => {
    counts[statusOf(order.orderStatus)] += 1;
  });
  return VALID_STATUSES.map((status) => ({ status, count: counts[status] })).filter((entry) => entry.count > 0);
}

function buildRecentOrders(orders: BackendOrder[]): RecentOrder[] {
  return [...orders]
    .sort((first, second) => new Date(second.orderDate ?? 0).getTime() - new Date(first.orderDate ?? 0).getTime())
    .slice(0, 6)
    .map((order) => ({
      orderId: order.orderId ?? 0,
      customerName: order.email ?? "Customer",
      email: order.email ?? "",
      orderDate: (order.orderDate ?? "").split("T")[0],
      total: order.totalAmount ?? 0,
      status: statusOf(order.orderStatus),
    }));
}

function buildSales(orders: BackendOrder[]): SalesOverview[] {
  const byDate = new Map<string, { orders: number; revenue: number }>();
  orders.forEach((order) => {
    const raw = (order.orderDate ?? "").split("T")[0].slice(0, 10);
    if (!raw) return;
    const entry = byDate.get(raw) ?? { orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += order.totalAmount ?? 0;
    byDate.set(raw, entry);
  });
  return [...byDate.entries()]
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .map(([date, value]) => ({ date, orders: value.orders, revenue: Math.round(value.revenue * 100) / 100 }));
}

function buildTopProducts(orders: BackendOrder[]): TopProduct[] {
  const byProduct = new Map<number, TopProduct>();
  orders.forEach((order) => {
    (order.items ?? []).forEach((item) => {
      const product = item.product;
      if (!product) return;
      const id = product.productId ?? 0;
      const entry = byProduct.get(id) ?? { productId: id, productName: product.productName ?? "Unknown product", image: product.image ?? "", unitsSold: 0 };
      entry.unitsSold += item.quantity ?? 0;
      byProduct.set(id, entry);
    });
  });
  return [...byProduct.values()].sort((first, second) => second.unitsSold - first.unitsSold).slice(0, 5);
}

export function AdminDashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      try {
        const [overviewResponse, ordersResponse] = await Promise.all([
          fetch("/api/admin/dashboard/overview", { signal: controller.signal }),
          fetch("/api/orders", { signal: controller.signal }),
        ]);
        const overviewData = await overviewResponse.json().catch(() => null) as DashboardResponse | { message?: string } | null;
        if (!overviewResponse.ok || !overviewData || !("payload" in overviewData)) {
          throw new Error(overviewData && "message" in overviewData && overviewData.message ? overviewData.message : "Unable to load dashboard data.");
        }
        const ordersPayload = await ordersResponse.json().catch(() => null) as { payload?: BackendOrder[]; message?: string } | BackendOrder[] | null;
        if (!ordersResponse.ok || ordersPayload === null) {
          throw new Error(ordersPayload && !Array.isArray(ordersPayload) && ordersPayload.message ? ordersPayload.message : "Unable to load orders for the dashboard.");
        }
        const orders = Array.isArray(ordersPayload) ? ordersPayload : ordersPayload.payload ?? [];

        const payload = overviewData.payload;
        const pendingCount = orders.filter((order) => order.orderStatus === "PENDING").length;
        setOverview({
          summary: {
            ...payload.summary,
            totalOrders: orders.length || payload.summary.totalOrders,
            pendingOrders: pendingCount || payload.summary.pendingOrders,
          },
          sales: payload.sales.length ? payload.sales : buildSales(orders),
          ordersByStatus: payload.ordersByStatus.length ? payload.ordersByStatus : buildStatuses(orders),
          recentOrders: payload.recentOrders.length ? payload.recentOrders : buildRecentOrders(orders),
          topProducts: payload.topProducts.length ? payload.topProducts : buildTopProducts(orders),
        });
      } catch (loadError) {
        if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
      }
    }

    void loadDashboard();
    return () => controller.abort();
  }, []);

  return <div className="flex min-w-295 bg-[#f8f9fb] font-sans"><Sidebar /><div className="min-h-screen flex-1"><Header /><main className="space-y-6 p-6">{error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}{!overview && !error ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div className="h-32 animate-pulse rounded-xl border border-gray-100 bg-white/80" key={index} />)}</div> : overview && <><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={ShoppingBag} iconBg="bg-indigo-50 text-indigo-600" label="Total Products" value={String(overview.summary.totalProducts)} /><StatCard icon={Users} iconBg="bg-emerald-50 text-emerald-600" label="Total Customers" value={String(overview.summary.totalCustomers)} /><StatCard icon={ShoppingCart} iconBg="bg-blue-50 text-blue-600" label="Total Orders" value={String(overview.summary.totalOrders)} /><StatCard icon={Package} iconBg="bg-orange-50 text-orange-500" label="Pending Orders" value={String(overview.summary.pendingOrders)} /></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="lg:col-span-2"><SalesChart sales={overview.sales} /></div><OrdersStatusChart statuses={overview.ordersByStatus} /></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><div className="lg:col-span-2"><RecentOrdersTable orders={overview.recentOrders} /></div><TopProductsList products={overview.topProducts} /></div></>}</main><footer className="py-4 text-center text-sm text-gray-400">© 2026 IndigoStore. All rights reserved.</footer></div></div>;
}