"use client";

import { useEffect, useMemo, useState } from "react";
import { addToast } from "@heroui/toast";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { ConfirmModal } from "../customers/ConfirmModal";
import { OrderCreateModal } from "./OrderCreateModal";
import { OrderDetailsDrawer } from "./OrderDetailsDrawer";
import { OrderFilters, type OrderFiltersState, emptyFilters } from "./OrderFilters";
import { OrderPageHeader } from "./OrderPageHeader";
import { OrderPagination } from "./OrderPagination";
import { OrdersSkeleton } from "./OrdersSkeleton";
import { OrderStats } from "./OrderStats";
import { OrderStatusTabs } from "./OrderStatusTabs";
import { OrdersTable } from "./OrdersTable";
import {
  currency,
  exportOrders,
  formatDate,
  orderLabel,
  type Order,
  type OrderItem,
  type OrderStatusKey,
  type PaymentStatusKey,
} from "./orders-data";

const catalogDefaultItem: OrderItem = { name: "Store order", sku: "SO-000", quantity: 1, price: 0 };

type DeleteTarget = { id: number; label: string; count: number } | null;

function download(name: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type BackendOrder = {
  orderId?: number;
  email?: string;
  orderDate?: string;
  orderStatus?: string;
  totalAmount?: number;
  payment?: { paymentMethod?: string } | null;
  items?: Array<{ quantity?: number; orderedProductPrice?: number; product?: { productName?: string; productId?: number } | null }>;
};

function mapOrder(value: BackendOrder): Order {
  const status = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(value.orderStatus ?? "") ? value.orderStatus as Order["status"] : "PENDING";
  const items = (value.items ?? []).map((item) => ({ name: item.product?.productName ?? "Store item", sku: item.product?.productId ? `SKU-${item.product.productId}` : "SO-000", quantity: item.quantity ?? 1, price: item.orderedProductPrice ?? 0 }));
  const total = value.totalAmount ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    orderId: value.orderId ?? 0,
    customer: { name: value.email ?? "Customer", email: value.email ?? "" },
    date: value.orderDate ?? new Date(0).toISOString(),
    status,
    payment: status === "CANCELLED" ? "REFUNDED" : status === "DELIVERED" || status === "SHIPPED" ? "PAID" : "PENDING",
    paymentMethod: value.payment?.paymentMethod ?? "Not specified",
    items,
    subTotal: total,
    shippingCost: 0,
    discount: 0,
    tax: 0,
    total,
    shippingAddress: { street: "", city: "", state: "", country: "", pincode: "" },
  };
}

async function fetchOrders(signal: AbortSignal): Promise<Order[]> {
  const response = await fetch("/api/orders", { signal, cache: "no-store" });
  const data = await response.json().catch(() => null) as { payload?: BackendOrder[]; message?: string } | BackendOrder[] | null;
  if (!response.ok) throw new Error(data && !Array.isArray(data) ? data.message : `Order API returned HTTP ${response.status}.`);
  const payload = Array.isArray(data) ? data : data?.payload;
  return Array.isArray(payload) ? payload.map(mapOrder) : [];
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filters, setFilters] = useState<OrderFiltersState>(emptyFilters);
  const [tab, setTab] = useState<OrderStatusKey | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetchOrders(controller.signal)
      .then((data) => { if (!controller.signal.aborted) setOrders(data); })
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const counts = useMemo(() => {
    const result: Record<OrderStatusKey, number> = { PENDING: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
    orders.forEach((order) => { result[order.status] += 1; });
    return result;
  }, [orders]);

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return orders
      .filter((order) => {
        if (tab !== "ALL" && order.status !== tab) return false;
        if (filters.status !== "ALL" && order.status !== filters.status) return false;
        if (filters.payment !== "ALL" && order.payment !== filters.payment) return false;
        if (filters.dateFrom && new Date(order.date) < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && new Date(order.date) > new Date(`${filters.dateTo}T23:59:59`)) return false;
        if (query) {
          const haystack = `${orderLabel(order.orderId)} ${order.customer.name} ${order.customer.email}`.toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime());
  }, [orders, tab, filters]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(page, pages - 1);
  const visible = filtered.slice(activePage * pageSize, (activePage + 1) * pageSize);
  const allSelected = visible.length > 0 && visible.every((order) => selected.has(order.orderId));

  const hasActiveFilters = Boolean(filters.search.trim() || filters.status !== "ALL" || filters.payment !== "ALL" || filters.dateFrom || filters.dateTo);

  const toast = (title: string, description?: string, color: "success" | "warning" | "danger" = "success") => {
    addToast({
      title,
      description,
      icon: color === "success" ? <CheckCircle2 className="h-5 w-5" /> : color === "warning" ? <XCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />,
      color,
      severity: color,
      variant: "solid",
      timeout: 4000,
      shouldShowTimeoutProgress: true,
    });
  };

  function resetFilters() {
    setFilters(emptyFilters);
    setTab("ALL");
    setPage(0);
  }

  function updateOrder(orderId: number, patch: Partial<Order>, message: string) {
    setOrders((current) => current.map((order) => order.orderId === orderId ? { ...order, ...patch } : order));
    setViewOrder((current) => current?.orderId === orderId ? { ...current, ...patch } : current);
    toast(message);
  }
  const bulkBusyWrapper = (process: () => void) => { setBulkBusy(true); window.setTimeout(() => { process(); setBulkBusy(false); }, 350); };
  const busyOrderWrapper = (orderId: number, process: () => void) => { setBusyId(orderId); window.setTimeout(() => { process(); setBusyId(null); }, 350); };

  function handleUpdateStatus(orderId: number, status: OrderStatusKey) {
    busyOrderWrapper(orderId, () => updateOrder(orderId, { status }, `Order ${orderLabel(orderId)} marked as ${status.toLowerCase()}.`));
  }

  function handleBulkStatus(status: OrderStatusKey) {
    const ids = [...selected];
    bulkBusyWrapper(() => {
      setOrders((current) => current.map((order) => ids.includes(order.orderId) ? { ...order, status } : order));
      setSelected(new Set());
      toast(`${ids.length} orders marked as ${status.toLowerCase()}.`);
    });
  }

  function handleCancel(order: Order) {
    updateOrder(
      order.orderId,
      { status: "CANCELLED", payment: "REFUNDED" as PaymentStatusKey },
      `Order ${orderLabel(order.orderId)} cancelled and payment refunded.`,
    );
  }

  function handlePrint() {
    window.print();
    toast("Invoice sent to printer.", undefined, "success");
  }

  function handleDownloadOrder(order: Order) {
    download(`invoice-${orderLabel(order.orderId)}.csv`, exportOrders([order]), "text/csv;charset=utf-8");
    toast("Invoice downloaded.", `invoice-${orderLabel(order.orderId)}.csv`, "success");
  }

  function handleExport() {
    if (!filtered.length) return;
    download(`orders-${new Date().toISOString().slice(0, 10)}.csv`, exportOrders(filtered), "text/csv;charset=utf-8");
    toast(`${filtered.length} orders exported.`);
  }

  function handleCreate({ customer, total }: { customer: { name: string; email: string }; total: number }) {
    setCreating(true);
    const nextId = orders.reduce((max, order) => Math.max(max, order.orderId), 0) + 1;
    const created: Order = {
      orderId: nextId,
      customer,
      date: new Date().toISOString(),
      status: "PENDING",
      payment: "PENDING",
      paymentMethod: "Card",
      items: [{ ...catalogDefaultItem, price: total }],
      subTotal: total,
      shippingCost: 0,
      discount: 0,
      tax: 0,
      total,
      shippingAddress: { street: "Pending address", city: "", state: "", country: "", pincode: "" },
    };
    window.setTimeout(() => {
      setOrders((current) => [created, ...current]);
      setFilters(emptyFilters);
      setTab("ALL");
      setPage(0);
      setCreateOpen(false);
      setCreating(false);
      setViewOrder(created);
      toast("Order created.", `Order ${orderLabel(nextId)} created for ${customer.name}.`);
    }, 350);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setOrders((current) => current.filter((order) => order.orderId !== id));
    setSelected((current) => { const next = new Set(current); next.delete(id); return next; });
    setDeleteTarget(null);
    toast("Order deleted.", `Order ${orderLabel(id)} was removed.`, "danger");
  }

  function handleBulkDelete() {
    if (!selected.size) return;
    setDeleteTarget({ id: -1, label: `${selected.size} orders`, count: selected.size });
  }

  function confirmBulkDelete() {
    const ids = [...selected];
    setOrders((current) => current.filter((order) => !ids.includes(order.orderId)));
    setSelected(new Set());
    setDeleteTarget(null);
    toast(`${ids.length} orders deleted.`, undefined, "danger");
  }

  return (
    <main className="min-h-screen bg-[#f8f9fc] p-6">
      <div className="mx-auto max-w-350 space-y-6">
        <OrderPageHeader total={orders.length} onExport={handleExport} onCreate={() => setCreateOpen(true)} />

        {loading ? (
          <OrdersSkeleton />
        ) : loadError ? (
          <div className="rounded-xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500"><XCircle className="h-7 w-7" aria-hidden="true" /></span>
            <h2 className="mt-4 text-base font-bold text-slate-800">Unable to load orders</h2>
            <p className="mt-1 text-sm text-slate-500">We couldn&apos;t retrieve your orders.</p>
            <button type="button" onClick={() => { setLoading(true); setLoadError(false); const controller = new AbortController(); void fetchOrders(controller.signal).then(setOrders).catch(() => setLoadError(true)).finally(() => setLoading(false)); }} className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />Try Again
            </button>
          </div>
        ) : (
          <>
            <OrderStats orders={orders} />
            <OrderStatusTabs counts={counts} active={tab} onChange={(value) => { setTab(value); setPage(0); }} />
            <OrderFilters filters={filters} onChange={(next) => { setFilters(next); setPage(0); }} onReset={resetFilters} results={filtered.length} />

            {viewOrder && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-700">
                <b>Quick view:</b>
                <span className="font-semibold">{orderLabel(viewOrder.orderId)}</span>
                <span className="text-indigo-500">·</span>
                <span>{viewOrder.customer.name}</span>
                <span className="text-indigo-500">·</span>
                <span className="font-medium tabular-nums">{currency.format(viewOrder.total)}</span>
                <span className="ml-auto text-xs text-indigo-500">{formatDate(viewOrder.date)}</span>
              </div>
            )}

            <OrdersTable
              orders={visible}
              selected={selected}
              allSelected={allSelected}
              onToggleAll={() => setSelected(allSelected ? new Set() : new Set(visible.map((order) => order.orderId)))}
              onToggle={(orderId) => setSelected((current) => { const next = new Set(current); if (next.has(orderId)) next.delete(orderId); else next.add(orderId); return next; })}
              busyId={busyId}
              onOpen={setViewOrder}
              onUpdateStatus={handleUpdateStatus}
              onCancel={handleCancel}
              onDelete={(order) => setDeleteTarget({ id: order.orderId, label: orderLabel(order.orderId), count: 1 })}
              onPrint={handlePrint}
              onDownload={handleDownloadOrder}
              selectedCount={selected.size}
              onClearSelection={() => setSelected(new Set())}
              onBulkStatus={handleBulkStatus}
              onBulkExport={() => { const ids = [...selected]; const chosen = orders.filter((order) => ids.includes(order.orderId)); download(`orders-${new Date().toISOString().slice(0, 10)}.csv`, exportOrders(chosen), "text/csv;charset=utf-8"); toast(`${chosen.length} orders exported.`); }}
              onBulkDelete={handleBulkDelete}
              bulkBusy={bulkBusy}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={resetFilters}
              onCreate={() => setCreateOpen(true)}
            />

            {filtered.length > 0 && (
              <OrderPagination page={activePage} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={(value) => { setPageSize(value); setPage(0); }} />
            )}
          </>
        )}
      </div>

      <OrderDetailsDrawer
        order={viewOrder}
        busy={busyId === viewOrder?.orderId}
        onClose={() => setViewOrder(null)}
        onUpdateStatus={(status) => { if (viewOrder) handleUpdateStatus(viewOrder.orderId, status); }}
        onPrint={handlePrint}
      />
      <OrderCreateModal key={createOpen ? "open" : "closed"} open={createOpen} busy={creating} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget && deleteTarget.count > 1 ? "Delete selected orders?" : "Delete this order?"}
        message={deleteTarget && deleteTarget.count > 1
          ? `This will permanently remove ${deleteTarget.label} from the orders list.`
          : `This will permanently remove order ${deleteTarget?.label ?? ""} from the orders list.`}
        confirmLabel={deleteTarget && deleteTarget.count > 1 ? "Delete orders" : "Delete order"}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteTarget && deleteTarget.count > 1 ? confirmBulkDelete : handleDelete}
      />
    </main>
  );
}