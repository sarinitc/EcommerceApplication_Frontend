import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ShopPage } from "@/components/shop/ShopPage";

export default async function ProductsRoute() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <ShopPage />;
}
