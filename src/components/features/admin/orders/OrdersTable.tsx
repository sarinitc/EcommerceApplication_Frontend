"use client";

import { Download, Loader2, Trash2, X } from "lucide-react";
import { currency, formatDate, orderLabel, ORDER_STATUSES, type Order, type OrderStatusKey } from "./orders-data";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderActionsMenu } from "./OrderActionsMenu";
import { OrderTableRow } from "./OrderTableRow";
import { OrderEmptyState } from "./OrderEmptyState";

type OrdersTableProps = {
  orders: Order[];
  selected: Set<number>;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggle: (orderId: number) => void;
  busyId: number | null;
  onOpen: (order: Order) => void;
  onUpdateStatus: (orderId: number, status: OrderStatusKey) => void;
  onCancel: (order: Order) => void;
  onDelete: (order: Order) => void;
  onPrint: (order: Order) => void;
  onDownload: (order: Order) => void;
  selectedCount: number;
  onClearSelection: () => void;
  onBulkStatus: (status: OrderStatusKey) => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  bulkBusy: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreate: () => void;
};

export function OrdersTable({
  orders, selected, allSelected, onToggleAll, onToggle, busyId, onOpen, onUpdateStatus, onCancel, onDelete, onPrint, onDownload,
  selectedCount, onClearSelection, onBulkStatus, onBulkExport, onBulkDelete, bulkBusy, hasActiveFilters, onClearFilters, onCreate,
}: OrdersTableProps) {
  if (!orders.length && selectedCount === 0) {
    return <OrderEmptyState hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} onCreate={onCreate} />;
  }

  return (
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-700">
          <b className="tabular-nums">{selectedCount} order{selectedCount === 1 ? "" : "s"} selected</b>
          <label className="relative ml-1">
            <span className="sr-only">Bulk update order status</span>
            <select
              value=""
              disabled={bulkBusy}
              onChange={(event) => { if (event.target.value) onBulkStatus(event.target.value as OrderStatusKey); }}
              className="h-9 rounded-md border border-indigo-200 bg-white py-1 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            >
              <option value="" disabled>Update Status</option>
              {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>)}
            </select>
          </label>
          <button type="button" onClick={onBulkExport} disabled={bulkBusy} className="inline-flex h-9 items-center gap-2 rounded-md bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60">
            {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            Export
          </button>
          <button type="button" onClick={onBulkDelete} disabled={bulkBusy} className="inline-flex h-9 items-center gap-2 rounded-md bg-red-600 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
          <button type="button" aria-label="Clear selection" onClick={onClearSelection} disabled={bulkBusy} className="ml-auto rounded-md p-1.5 text-indigo-400 transition hover:bg-indigo-100 hover:text-indigo-600 disabled:opacity-50">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <tr className="border-b border-gray-100">
              <th className="w-12 px-4 py-3">
                <input type="checkbox" aria-label="Select all orders on this page" checked={allSelected} disabled={bulkBusy} onChange={onToggleAll} className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600" />
              </th>
              <th className="px-3 py-3">Order ID</th>
              <th className="px-3 py-3">Customer</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Payment</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Items</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <OrderTableRow
                key={order.orderId}
                order={order}
                selected={selected.has(order.orderId)}
                disabled={bulkBusy}
                busy={busyId === order.orderId}
                onToggle={() => onToggle(order.orderId)}
                actions={{
                  onOpen: () => onOpen(order),
                  onUpdateStatus: (status) => onUpdateStatus(order.orderId, status),
                  onCancel: () => onCancel(order),
                  onDelete: () => onDelete(order),
                  onPrint: () => onPrint(order),
                  onDownload: () => onDownload(order),
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile order cards */}
      <div className="divide-y divide-gray-100 md:hidden">
        {orders.map((order) => {
          const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
          return (
            <article key={order.orderId} className="bg-white p-4 transition-colors duration-150 hover:bg-slate-50/70">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${orderLabel(order.orderId)}`}
                    checked={selected.has(order.orderId)}
                    disabled={bulkBusy}
                    onChange={() => onToggle(order.orderId)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600"
                  />
                  <button type="button" onClick={() => onOpen(order)} className="font-semibold text-indigo-600 hover:text-indigo-800">
                    {orderLabel(order.orderId)}
                  </button>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600" aria-hidden="true">
                  {order.customer.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-700">{order.customer.name}</span>
                  <span className="block truncate text-xs text-slate-400">{order.customer.email}</span>
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold tabular-nums text-slate-800">{currency.format(order.total)}</span>
                <span className="text-xs tabular-nums text-slate-500">{itemCount} item{itemCount === 1 ? "" : "s"}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{formatDate(order.date)}</p>
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => onOpen(order)}
                  className="rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                >
                  View Order
                </button>
                <OrderActionsMenu
                  order={order}
                  busy={busyId === order.orderId}
                  onView={() => onOpen(order)}
                  onEdit={() => onOpen(order)}
                  onViewCustomer={() => onOpen(order)}
                  onUpdateStatus={(status) => onUpdateStatus(order.orderId, status)}
                  onPrint={() => onPrint(order)}
                  onDownload={() => onDownload(order)}
                  onCancel={() => onCancel(order)}
                  onDelete={() => onDelete(order)}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}