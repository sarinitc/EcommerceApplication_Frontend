import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "../AdminShell";
import { ProductsList } from "./ProductsList";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(session.user as { roles?: string[] }).roles?.includes("ADMIN")) redirect("/");

  return <AdminShell><ProductsList /></AdminShell>;
}
