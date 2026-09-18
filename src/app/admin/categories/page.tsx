import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/features/admin/AdminShell";
import { CategoriesList } from "@/components/features/admin/categories/CategoriesList";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(session.user as { roles?: string[] }).roles?.includes("ADMIN")) redirect("/");

  return <AdminShell><CategoriesList /></AdminShell>;
}