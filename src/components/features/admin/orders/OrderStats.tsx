import { CheckCircle2, Clock, DollarSign, RefreshCw, ShoppingBag } from "lucide-react";
import { StatCard } from "../StatCard";
import { currency, type Order } from "./orders-data";

export function OrderStats({ orders }: { orders: Order[] }) {
  const total = orders.length;
  const pending = orders.filter((order) => order.status === "PENDING").length;
  const processing = orders.filter((order) => order.status === "PROCESSING").length;
  const delivered = orders.filter((order) => order.status === "DELIVERED").length;
  const revenue = Math.round(orders.reduce((sum, order) => sum + order.total, 0) * 100) / 100;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      <StatCard icon={ShoppingBag} iconBg="bg-indigo-50 text-indigo-600" label="Total Orders" value={String(total)} subtitle="All time orders" />
      <StatCard icon={Clock} iconBg="bg-amber-50 text-amber-600" label="Pending Orders" value={String(pending)} subtitle="Awaiting approval" />
      <StatCard icon={RefreshCw} iconBg="bg-blue-50 text-blue-600" label="Processing" value={String(processing)} subtitle="In the fulfillment queue" />
      <StatCard icon={CheckCircle2} iconBg="bg-emerald-50 text-emerald-600" label="Delivered" value={String(delivered)} subtitle="Completed deliveries" />
      <StatCard icon={DollarSign} iconBg="bg-violet-50 text-violet-600" label="Total Revenue" value={currency.format(revenue)} subtitle="Accumulated sales" />
    </div>
  );
}