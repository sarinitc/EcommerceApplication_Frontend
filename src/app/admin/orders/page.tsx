import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/features/admin/AdminShell";
import { OrdersPage } from "@/components/features/admin/orders/OrdersPage";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(session.user as { roles?: string[] }).roles?.includes("ADMIN")) redirect("/");

  return <AdminShell><OrdersPage /></AdminShell>;
}