import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CustomerDashboard } from "@/components/features/dashboard/CustomerDashboard";

export default async function CustomerDashboardRoute() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <CustomerDashboard
      name={session.user.name || "Member"}
      email={session.user.email || ""}
    />
  );
}