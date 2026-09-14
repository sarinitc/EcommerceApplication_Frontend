import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/features/admin/AdminShell";
import { ProductsList } from "@/components/features/admin/products/ProductsList";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(session.user as { roles?: string[] }).roles?.includes("ADMIN")) redirect("/");

  return <AdminShell><ProductsList /></AdminShell>;
}
