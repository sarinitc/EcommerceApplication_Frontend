import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "../../AdminShell";
import { CreateProductForm } from "./CreateProductForm";

export default async function CreateProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(session.user as { roles?: string[] }).roles?.includes("ADMIN")) redirect("/");

  return <AdminShell><CreateProductForm /></AdminShell>;
}
