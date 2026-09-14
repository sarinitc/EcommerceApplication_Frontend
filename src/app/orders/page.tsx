import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function Page() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <SiteHeader />
      <div className="mx-auto grid max-w-7xl place-items-center px-5 py-32 text-center sm:px-8 lg:px-10">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Orders</h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-ink/55">View and manage your past and current orders from this page.</p>
      </div>
      <SiteFooter />
    </main>
  );
}
