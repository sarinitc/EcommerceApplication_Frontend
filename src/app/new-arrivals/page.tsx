import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { NewArrivalsPage } from "@/components/shop/NewArrivalsPage";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <NewArrivalsPage />
      <SiteFooter />
    </>
  );
}
