export type OrderStatusKey = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatusKey = "PAID" | "PENDING" | "FAILED" | "REFUNDED";

export type OrderItem = {
  name: string;
  sku: string;
  quantity: number;
  price: number;
};

export type OrderTimelineStep = {
  label: string;
  state: "done" | "current" | "upcoming";
  timestamp?: string;
};

export type Order = {
  orderId: number;
  customer: { name: string; email: string };
  date: string;
  status: OrderStatusKey;
  payment: PaymentStatusKey;
  paymentMethod: string;
  items: OrderItem[];
  subTotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  shippingAddress: { street: string; city: string; state: string; country: string; pincode: string };
};

export const ORDER_STATUSES: OrderStatusKey[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
export const PAYMENT_STATUSES: PaymentStatusKey[] = ["PAID", "PENDING", "FAILED", "REFUNDED"];

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const decimal = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(date));
}

export function orderLabel(id: number) {
  return `ORD-${id}`;
}

/* ---------------------------------- data ---------------------------------- */

const catalog: OrderItem[] = [
  { name: "Wireless Headphones", sku: "HD-201", quantity: 1, price: 24 },
  { name: "Smart Watch", sku: "WS-204", quantity: 1, price: 30 },
  { name: "Running Shoes", sku: "RS-110", quantity: 1, price: 34 },
  { name: "Mechanical Keyboard", sku: "KB-330", quantity: 1, price: 40 },
  { name: "USB-C Hub", sku: "HB-019", quantity: 1, price: 26 },
  { name: "Slim Phone Case", sku: "PC-044", quantity: 1, price: 20 },
  { name: "Canvas Backpack", sku: "BP-077", quantity: 1, price: 32 },
  { name: "Coffee Mug 12oz", sku: "MG-302", quantity: 1, price: 46 },
];

const customers: { name: string; email: string }[] = [
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Smith", email: "jane@example.com" },
  { name: "Robert Johnson", email: "robert@example.com" },
  { name: "Emily Davis", email: "emily@example.com" },
  { name: "Michael Brown", email: "michael@example.com" },
  { name: "Jessica Wilson", email: "jessica@example.com" },
  { name: "David Martinez", email: "david@example.com" },
  { name: "Sarah Taylor", email: "sarah@example.com" },
  { name: "James Anderson", email: "james@example.com" },
  { name: "Olivia Thomas", email: "olivia@example.com" },
  { name: "William Jackson", email: "william@example.com" },
  { name: "Sophia White", email: "sophia@example.com" },
  { name: "Daniel Harris", email: "daniel@example.com" },
  { name: "Ava Martin", email: "ava@example.com" },
  { name: "Matthew Thompson", email: "matthew@example.com" },
  { name: "Isabella Garcia", email: "isabella@example.com" },
];

const baseDate = new Date("2026-09-17T00:00:00");

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function buildTimeline(order: Order): OrderTimelineStep[] {
  const steps: OrderTimelineStep[] = [{ label: "Order placed", state: "done", timestamp: order.date }];

  if (order.status === "CANCELLED") {
    steps.push({ label: "Order cancelled", state: "current", timestamp: addMinutes(order.date, 45) });
    return steps;
  }

  const confirmed: OrderTimelineStep = order.payment === "FAILED"
    ? { label: "Payment failed", state: "current", timestamp: addMinutes(order.date, 2) }
    : order.payment === "PENDING"
      ? { label: "Payment confirmation", state: "current", timestamp: addMinutes(order.date, 2) }
      : { label: "Payment confirmed", state: "done", timestamp: addMinutes(order.date, 2) };
  steps.push(confirmed);

  steps.push({ label: "Processing", state: order.status === "PROCESSING" ? "current" : order.status === "PENDING" ? "upcoming" : "done", timestamp: order.status === "PROCESSING" ? addMinutes(order.date, 25) : order.status === "PENDING" ? undefined : addMinutes(order.date, 25) });
  steps.push({ label: "Shipped", state: order.status === "SHIPPED" ? "current" : order.status === "DELIVERED" ? "done" : "upcoming", timestamp: order.status === "SHIPPED" ? addMinutes(order.date, 250) : order.status === "DELIVERED" ? addMinutes(order.date, 250) : undefined });
  steps.push({ label: "Delivered", state: order.status === "DELIVERED" ? "current" : "upcoming", timestamp: order.status === "DELIVERED" ? addMinutes(order.date, 1450) : undefined });

  return steps;
}

function buildOrders(): Order[] {
  const statusCounts: Record<OrderStatusKey, number> = { PENDING: 16, PROCESSING: 64, SHIPPED: 120, DELIVERED: 32, CANCELLED: 8 };
  const orders: Order[] = [];
  let index = 0;

  (Object.entries(statusCounts) as [OrderStatusKey, number][]).forEach(([status, count]) => {
    for (let cursor = 0; cursor < count; cursor += 1) {
      const sequence = index + 1;
      const orderId = 2500 - sequence;
      const customer = customers[(sequence * 7) % customers.length];
      const itemCount = sequence % 2 === 0 ? 2 : 1;
      const items = Array.from({ length: itemCount }, (_, itemIndex) => ({ ...catalog[(sequence + itemIndex) % catalog.length] }));
      const subTotal = items.reduce((sum, item) => sum + item.price, 0);
      const shippingCost = subTotal >= 150 ? 0 : 5;
      const discount = status === "CANCELLED" ? 0 : subTotal >= 150 ? 15 : 5;
      const tax = Math.round((subTotal * 8) / 100);
      const total = Math.round((subTotal + shippingCost + tax - discount) * 100) / 100;

      const payment: PaymentStatusKey = status === "CANCELLED" ? "REFUNDED"
        : status === "SHIPPED" || status === "DELIVERED" ? "PAID"
          : status === "PENDING" ? (sequence % 4 === 0 ? "FAILED" : sequence % 5 === 0 ? "PENDING" : "PAID")
            : sequence % 8 === 0 ? "PENDING" : "PAID";

      const date = new Date(baseDate.getTime() - sequence * 47 * 60_000).toISOString();

      orders.push({
        orderId,
        customer: { ...customer },
        date,
        status,
        payment,
        paymentMethod: sequence % 3 === 0 ? "PayPal" : "Card",
        items,
        subTotal,
        shippingCost,
        discount,
        tax,
        total,
        shippingAddress: { street: `${120 + sequence} Elm Street`, city: "San Francisco", state: "CA", country: "United States", pincode: `941${String(sequence % 10)}${String(sequence % 10)}` },
      });

      index += 1;
    }
  });

  return orders.sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime());
}

export const sampleOrders: Order[] = buildOrders();

/* Status timeline is stored on the order for the drawer. */
export function timelineFor(order: Order): OrderTimelineStep[] {
  return buildTimeline(order);
}

/* ------------------------------ csv export ------------------------------- */

export function exportOrders(orders: Order[]): string {
  const header = ["Order ID", "Customer", "Email", "Date", "Status", "Payment", "Items", "Total"];
  const rows = orders.map((order) => [
    orderLabel(order.orderId),
    order.customer.name,
    order.customer.email,
    formatDate(order.date),
    order.status,
    order.payment,
    String(order.items.reduce((sum, item) => sum + item.quantity, 0)),
    order.total.toFixed(2),
  ]);
  return [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}