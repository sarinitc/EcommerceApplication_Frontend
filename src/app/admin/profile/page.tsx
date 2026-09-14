import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/features/admin/AdminShell";
import { AdminProfilePage } from "@/components/features/admin/profile/AdminProfilePage";

export default async function AdminProfileRoute() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const roles = (session.user as { roles?: string[] }).roles;
  if (!roles?.includes("ADMIN")) redirect("/");

  return (
    <AdminShell>
      <AdminProfilePage
        name={session.user.name || "Administrator"}
        email={session.user.email || ""}
        image={session.user.image}
        adminId={(session as typeof session & { backendUserId?: string | number }).backendUserId}
        roles={roles}
      />
    </AdminShell>
  );
}