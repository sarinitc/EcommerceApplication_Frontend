import { currency, formatDate, orderLabel, type Order } from "./orders-data";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { OrderActionsMenu } from "./OrderActionsMenu";
import type { OrderStatusKey } from "./orders-data";

type OrderActions = {
  onOpen: () => void;
  onUpdateStatus: (status: OrderStatusKey) => void;
  onCancel: () => void;
  onDelete: () => void;
  onPrint: () => void;
  onDownload: () => void;
};

export function OrderTableRow({ order, selected, disabled, onToggle, busy, actions }: {
  order: Order;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  busy: boolean;
  actions: OrderActions;
}) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <tr className="group border-t border-gray-100 transition-colors duration-150 hover:bg-slate-50/70">
      <td className="px-4 py-3.5">
        <div className="flex items-center">
          <input
            type="checkbox"
            aria-label={`Select ${orderLabel(order.orderId)}`}
            checked={selected}
            disabled={disabled}
            onChange={onToggle}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600"
          />
        </div>
      </td>
      <td className="px-3 py-3.5">
        <button
          type="button"
          onClick={actions.onOpen}
          className="font-semibold text-indigo-600 transition-colors duration-150 hover:text-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          {orderLabel(order.orderId)}
        </button>
      </td>
      <td className="px-3 py-3.5">
        <button type="button" onClick={actions.onOpen} className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600" aria-hidden="true">
            {order.customer.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-700">{order.customer.name}</span>
            <span className="block truncate text-xs text-slate-400">{order.customer.email}</span>
          </span>
        </button>
      </td>
      <td className="px-3 py-3.5 whitespace-nowrap text-sm text-slate-500">{formatDate(order.date)}</td>
      <td className="px-3 py-3.5">
        <div className="whitespace-nowrap text-sm">
          {order.discount > 0 && <span className="mr-2 text-xs text-slate-400 line-through">{currency.format(order.subTotal + order.shippingCost + order.tax)}</span>}
          <span className="font-medium tabular-nums text-slate-800">{currency.format(order.total)}</span>
        </div>
      </td>
      <td className="px-3 py-3.5">
        <PaymentStatusBadge status={order.payment} />
      </td>
      <td className="px-3 py-3.5">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-3 py-3.5 text-sm tabular-nums text-slate-500">
        {itemCount} item{itemCount === 1 ? "" : "s"}
      </td>
      <td className="px-3 py-3.5 text-right">
        <OrderActionsMenu
          order={order}
          busy={busy}
          onView={actions.onOpen}
          onEdit={actions.onOpen}
          onViewCustomer={actions.onOpen}
          onUpdateStatus={actions.onUpdateStatus}
          onPrint={actions.onPrint}
          onDownload={actions.onDownload}
          onCancel={actions.onCancel}
          onDelete={actions.onDelete}
        />
      </td>
    </tr>
  );
}