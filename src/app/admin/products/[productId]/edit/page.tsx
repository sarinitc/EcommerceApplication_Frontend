import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/features/admin/AdminShell";
import { EditProductForm } from "@/components/features/admin/products/EditProductForm";

export default async function EditProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(session.user as { roles?: string[] }).roles?.includes("ADMIN")) redirect("/");

  return <AdminShell><EditProductForm /></AdminShell>;
}
