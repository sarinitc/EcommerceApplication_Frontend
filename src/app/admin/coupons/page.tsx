import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/features/admin/AdminShell";
import { CouponsSection } from "@/components/features/admin/settings/AdminSettingsPage";

export default async function AdminCouponsRoute() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(session.user as { roles?: string[] }).roles?.includes("ADMIN")) redirect("/");

  return <AdminShell><main className="min-h-screen bg-[#f8f9fc] p-5 sm:p-6"><CouponsSection standalone /></main></AdminShell>;
}