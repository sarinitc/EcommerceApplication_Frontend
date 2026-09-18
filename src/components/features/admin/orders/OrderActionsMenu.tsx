"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ChevronRight,
  Download,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Printer,
  RefreshCw,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { ORDER_STATUSES, type Order, type OrderStatusKey } from "./orders-data";

type OrderActionsMenuProps = {
  order: Order;
  busy?: boolean;
  onView: () => void;
  onEdit: () => void;
  onViewCustomer: () => void;
  onUpdateStatus: (status: OrderStatusKey) => void;
  onPrint: () => void;
  onDownload: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

const itemClass = "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-500";
const iconClass = "h-4 w-4 shrink-0 text-slate-400";

export function OrderActionsMenu({ order, busy, onView, onEdit, onViewCustomer, onUpdateStatus, onPrint, onDownload, onCancel, onDelete }: OrderActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [statusMenu, setStatusMenu] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (statusMenu) { setStatusMenu(false); return; }
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, statusMenu]);

  function close() {
    setStatusMenu(false);
    setOpen(false);
    menuRef.current?.focus();
  }

  if (busy) {
    return (
      <span className="grid h-8 w-8 place-items-center text-slate-400" aria-label="Updating order">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={`Actions for ${order.customer.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => { setOpen((current) => !current); setStatusMenu(false); }}
        className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        <div id={menuId} ref={menuRef} role="menu" aria-label="Order actions" className="absolute right-0 top-full z-30 mt-1 w-52 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <div className="relative">
            <div role="menuitem" className={itemClass} onClick={() => { onView(); close(); }}>
              <Eye className={iconClass} aria-hidden="true" />View order
            </div>
            <div role="menuitem" className={itemClass} onClick={() => { onEdit(); close(); }}>
              <Pencil className={iconClass} aria-hidden="true" />Edit order
            </div>
            <div
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={statusMenu}
              className={`${itemClass} relative`}
              onMouseEnter={() => { if (open) setStatusMenu(true); }}
              onClick={(event) => {
                event.stopPropagation();
                setStatusMenu((current) => !current);
              }}
            >
              <RefreshCw className={iconClass} aria-hidden="true" />Update status
              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
              {statusMenu && (
                <div role="menu" aria-label="Choose order status" className="absolute left-full top-0 z-40 ml-1 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      role="menuitemradio"
                      aria-checked={order.status === status}
                      onClick={(event) => { event.stopPropagation(); onUpdateStatus(status); close(); }}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-500 ${order.status === status ? "bg-indigo-50 font-semibold text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div role="menuitem" className={itemClass} onClick={() => { onViewCustomer(); close(); }}>
              <User className={iconClass} aria-hidden="true" />View customer
            </div>
            <div className="my-1.5 border-t border-slate-100" />
            <div role="menuitem" className={itemClass} onClick={() => { onPrint(); close(); }}>
              <Printer className={iconClass} aria-hidden="true" />Print invoice
            </div>
            <div role="menuitem" className={itemClass} onClick={() => { onDownload(); close(); }}>
              <Download className={iconClass} aria-hidden="true" />Download invoice
            </div>
            <div className="my-1.5 border-t border-slate-100" />
            <div role="menuitem" className={`${itemClass} text-red-600 hover:bg-red-50 hover:text-red-700`} onClick={() => { onCancel(); close(); }}>
              <XCircle className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />Cancel order
            </div>
            <div role="menuitem" className={`${itemClass} text-red-600 hover:bg-red-50 hover:text-red-700`} onClick={() => { onDelete(); close(); }}>
              <Trash2 className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />Delete order
            </div>
          </div>
        </div>
      )}
    </div>
  );
}