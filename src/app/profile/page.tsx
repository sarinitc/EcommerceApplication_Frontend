import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfilePage } from "@/components/features/profile/ProfilePage";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <ProfilePage name={session.user.name || "Member"} email={session.user.email || ""} image={session.user.image} />;
}
