import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/features/admin/AdminShell";
import { AdminAddressesPage } from "@/components/features/admin/addresses/AdminAddressesPage";

export default async function AdminAddressesRoute() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(session.user as { roles?: string[] }).roles?.includes("ADMIN")) redirect("/");
  return <AdminShell><AdminAddressesPage /></AdminShell>;
}