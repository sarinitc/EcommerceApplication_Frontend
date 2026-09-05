import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(session.user as { roles?: string[] }).roles?.includes("ADMIN")) redirect("/");

  return <AdminDashboard />;
}
