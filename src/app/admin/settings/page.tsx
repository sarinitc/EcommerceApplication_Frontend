import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/features/admin/AdminShell";
import { AdminSettingsPage } from "@/components/features/admin/settings/AdminSettingsPage";

export default async function AdminSettingsRoute() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(session.user as { roles?: string[] }).roles?.includes("ADMIN")) redirect("/");

  return <AdminShell><AdminSettingsPage /></AdminShell>;
}