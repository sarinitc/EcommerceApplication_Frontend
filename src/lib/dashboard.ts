export type DashboardSummary = {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
};

export type SalesOverview = { date: string; orders: number; revenue: number };
export type OrderStatus = { status: string; count: number };
export type RecentOrder = { orderId: number; customerName: string; email: string; orderDate: string; total: number; status: string };
export type TopProduct = { productId: number; productName: string; image: string; unitsSold: number };

export type DashboardOverview = {
  summary: DashboardSummary;
  sales: SalesOverview[];
  ordersByStatus: OrderStatus[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
};
