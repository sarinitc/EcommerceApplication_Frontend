import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const categories = [
  { name: "Electronics", detail: "Designed for daily rituals", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85" },
  { name: "Fashion", detail: "Quiet confidence, considered", image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1200&q=85" },
  { name: "Home & Living", detail: "Objects for slower moments", image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85" },
  { name: "Accessories", detail: "The finishing touch", image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=85" },
];

const picks = [
  { id: 1, name: "Studio Sound Speaker", category: "Audio", price: 149, oldPrice: 0, rating: "4.9", tag: "Best seller", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=700&q=85" },
  { id: 2, name: "Orbit Smart Lamp", category: "Lighting", price: 98, oldPrice: 128, rating: "4.7", tag: "-23%", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85" },
  { id: 3, name: "Slate Mechanical Keyboard", category: "Workspace", price: 129, oldPrice: 0, rating: "4.8", tag: "New", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=85" },
  { id: 4, name: "Field Camera", category: "Photography", price: 329, oldPrice: 0, rating: "4.8", tag: "Limited", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=85" },
];

const craft = [
  "Responsibly sourced, durable materials",
  "Designed in-house by a small studio",
  "Built to be repaired, not replaced",
];

const stats = [
  { value: "12k+", label: "Orders delivered" },
  { value: "4.9", label: "Average rating" },
  { value: "98%", label: "On-time delivery" },
  { value: "30 day", label: "Easy returns" },
];

function Icon({ name, className = "" }: { name: "arrow" | "bag" | "check" | "mail" | "quote" | "search" | "shield" | "star" | "support" | "truck" | "user"; className?: string }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    bag: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    quote: <path d="M9 7c-2.8 0-5 2.2-5 5v5h5v-5H6c0-1.7 1.3-3 3-3zM19 7c-2.8 0-5 2.2-5 5v5h5v-5h-3c0-1.7 1.3-3 3-3z" />,
    search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></>,
    shield: <><path d="M12 3 19 6v5c0 4.6-3 7.9-7 10-4-2.1-7-5.4-7-10V6z" /><path d="m9 12 2 2 4-4" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />,
    support: <><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><path d="M4 13h3v5H5a1 1 0 0 1-1-1zM20 13h-3v5h2a1 1 0 0 0 1-1z" /><path d="M17 18c0 2-1.7 3-4 3h-1" /></>,
    truck: <><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.5" /><circle cx="18" cy="18" r="1.5" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>{paths[name]}</svg>;
}

function Stars({ rating }: { rating: string }) {
  return (
    <span className="flex items-center gap-1.5" aria-label={`Rated ${rating} out of 5`}>
      <span className="flex gap-0.5 text-[#e3a52b]">{Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" className="h-3.5 w-3.5 fill-current stroke-current" />)}</span>
      <span className="text-[11px] text-slate-500">{rating}</span>
    </span>
  );
}

function SectionHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#5b55d4]">{kicker}</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-.055em] text-[#172033] sm:text-5xl">{title}</h2>
      </div>
      <p className="max-w-xs text-sm leading-6 text-slate-500">{children}</p>
    </div>
  );
}

const benefits = [
  { icon: "truck" as const, title: "Free shipping", text: "On orders over $50" },
  { icon: "shield" as const, title: "Secure payment", text: "Protected checkout" },
  { icon: "support" as const, title: "Here when you need us", text: "24/7 customer care" },
];

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <main className="min-h-screen overflow-x-hidden bg-canvas text-ink selection:bg-brand-light selection:text-ink">
    <style>{`@keyframes indigo-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}@keyframes indigo-drift{from{transform:scale(1.02)}to{transform:scale(1.08)}}@keyframes indigo-float{from,to{transform:translateY(-6px)}50%{transform:translateY(6px)}}@keyframes indigo-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}.indigo-rise{animation:indigo-rise .7s cubic-bezier(.22,1,.36,1) both}.indigo-drift{animation:indigo-drift 12s ease-in-out alternate infinite}.indigo-float{animation:indigo-float 7s ease-in-out infinite}.indigo-bounce{animation:indigo-bounce 1.6s ease-in-out infinite}@media (prefers-reduced-motion:reduce){.indigo-rise,.indigo-drift,.indigo-float,.indigo-bounce{animation:none}}`}</style>
    <SiteHeader />

    {/* Hero */}
    <section className="mx-auto max-w-7xl px-5 pt-5 sm:px-8 lg:px-10 lg:pt-8">
      <div className="relative isolate min-h-[580px] overflow-hidden rounded-[2rem] bg-[#20223d] shadow-[0_30px_70px_rgba(32,34,61,.28)] sm:min-h-[640px]">
        <div className="indigo-drift absolute inset-0 -z-30 bg-[url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=90')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(20,22,41,.94)_0%,rgba(20,22,41,.76)_42%,rgba(20,22,41,.20)_70%,rgba(20,22,41,.04)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(12,15,32,.32)_0%,transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(0deg,rgba(20,22,41,.42),transparent)]" />

        {/* Floating social proof + product card (desktop) */}
        <div className="absolute right-12 top-16 z-10 hidden flex-col items-stretch gap-5 lg:flex xl:right-20">
          <div className="indigo-float flex items-center gap-3 rounded-full border border-white/25 bg-[#191b36]/60 px-5 py-3 text-white shadow-[0_18px_40px_rgba(0,0,0,.35)] backdrop-blur-xl" style={{ animationDelay: "200ms" }}>
            <span className="flex text-[#e9c96b]">{Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" className="h-3.5 w-3.5 fill-current stroke-current" />)}</span>
            <span className="text-xs font-semibold">4.9 &#183; Loved by 12,000+</span>
          </div>
          <Link href="/products/2" className="indigo-float group/card block w-56 translate-y-4 rounded-2xl border border-white/25 bg-[#191b36]/60 p-3 text-white shadow-[0_26px_55px_rgba(0,0,0,.42)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/50" style={{ animationDelay: "900ms" }}>
            <div className="overflow-hidden rounded-xl">
              <div className="aspect-[4/3] w-full bg-cover bg-center transition duration-500 group-hover/card:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85')" }} />
            </div>
            <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-3">
              <span>
                <span className="block text-[9px] font-bold uppercase tracking-[.16em] text-[#b9b5ff]">Best seller</span>
                <span className="mt-1 block font-display text-sm font-semibold leading-tight">Orbit Smart Lamp</span>
                <span className="mt-1 block text-xs font-bold">$98 <span className="text-white/55 line-through">$128</span></span>
              </span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-white shadow-[0_8px_18px_rgba(79,70,217,.45)] transition duration-300 group-hover/card:rotate-45"><Icon name="arrow" className="h-4 w-4 fill-none stroke-current stroke-2" /></span>
            </div>
          </Link>
        </div>

        <div className="flex min-h-[580px] max-w-xl flex-col justify-center px-7 py-16 text-white sm:min-h-[640px] sm:px-14 lg:px-20">
          <p className="indigo-rise mb-4 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#d7d6ff]" style={{ animationDelay: "80ms" }}><span className="h-px w-7 bg-[#a8a5ff]" />New collection <span className="text-[#a8a5ff]">/</span> 2026</p>
          <h1 className="indigo-rise max-w-lg font-display text-5xl font-semibold leading-[.94] tracking-[-.065em] sm:text-6xl lg:text-7xl" style={{ animationDelay: "160ms" }}>Objects for a <em className="font-normal text-[#d8d6ff]">well-lived</em> life.</h1>
          <p className="indigo-rise mt-7 max-w-md text-sm leading-7 text-slate-200 sm:text-[15px]" style={{ animationDelay: "240ms" }}>Curated pieces with enduring materials, thoughtful design, and a quieter point of view.</p>
          <div className="indigo-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "320ms" }}>
            <Link className="group inline-flex items-center gap-3 rounded-full bg-brand px-6 py-3.5 text-xs font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,.28)] transition duration-300 hover:-translate-y-1 hover:bg-brand-hover hover:shadow-[0_16px_34px_rgba(0,0,0,.36)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href="/products">Explore collection <Icon name="arrow" className="h-4 w-4 fill-none stroke-current stroke-2 transition-transform group-hover:translate-x-1" /></Link>
            <Link className="rounded-full border border-white/35 px-6 py-3.5 text-xs font-bold text-white transition hover:border-white hover:bg-white/10" href="/new-arrivals">Explore new arrivals</Link>
          </div>
          <div className="indigo-rise mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/15 pt-6" style={{ animationDelay: "400ms" }}>
            <span className="flex items-center gap-2"><span className="flex text-[#e9c96b]">{Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" className="h-3.5 w-3.5 fill-current stroke-current" />)}</span><span className="text-xs font-semibold text-white/90">4.9 from 2,300 reviews</span></span>
            <span className="flex items-center gap-2"><Icon name="truck" className="h-4 w-4 fill-none stroke-current stroke-[1.7] text-[#a8a5ff]" /><span className="text-xs text-white/80">Free shipping over $50</span></span>
            <span className="flex items-center gap-2"><Icon name="shield" className="h-4 w-4 fill-none stroke-current stroke-[1.7] text-[#a8a5ff]" /><span className="text-xs text-white/80">30-day returns</span></span>
          </div>
        </div>

        {/* Scroll cue */}
        <a href="#collections" className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 rounded-full border border-white/20 bg-[#191b36]/40 px-4 py-2 text-white/75 backdrop-blur transition hover:bg-white/10 hover:text-white lg:flex" aria-label="Scroll to collections">
          <span className="text-[9px] font-bold uppercase tracking-[.22em]">Scroll</span>
          <span className="indigo-bounce grid h-6 w-6 place-items-center rounded-full border border-white/35"><Icon name="arrow" className="h-3.5 w-3.5 rotate-90 fill-none stroke-current stroke-2" /></span>
        </a>
      </div>
    </section>

    {/* Benefits */}
    <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-5 sm:px-8 lg:px-10" aria-label="Store benefits">
      <div className="grid overflow-hidden rounded-2xl border border-white/70 bg-[#fcfcfb]/95 shadow-[0_18px_45px_rgba(32,34,61,.13)] backdrop-blur md:grid-cols-3">
        {benefits.map((benefit) => (
          <div className="group flex items-center gap-4 border-b border-slate-200/80 px-6 py-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 sm:px-8" key={benefit.title}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-light text-brand transition duration-300 group-hover:-translate-y-1 group-hover:bg-brand group-hover:text-white"><Icon name={benefit.icon} className="h-5 w-5 fill-none stroke-current stroke-[1.7]" /></span>
            <span><strong className="block text-xs font-bold text-slate-800">{benefit.title}</strong><span className="mt-1 block text-[11px] text-slate-500">{benefit.text}</span></span>
          </div>
        ))}
      </div>
    </section>

    {/* Categories */}
    <section id="collections" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-20 pt-20 sm:px-8 lg:px-10 lg:pb-28">
      <SectionHeader kicker="The daily edit" title="Shop by category">Find beautiful, useful things made to be kept close.</SectionHeader>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {categories.map((category, index) => (
          <Link className="group relative isolate min-h-[330px] overflow-hidden rounded-2xl bg-slate-900 shadow-[0_12px_25px_rgba(31,40,62,.10)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_22px_44px_rgba(31,40,62,.20)] sm:min-h-[360px]" href={`/products?category=${encodeURIComponent(category.name)}`} key={category.name}>
            <div className="absolute inset-0 -z-20 bg-cover bg-center transition duration-700 ease-out group-hover:scale-110" style={{ backgroundImage: `url(${category.image})`, backgroundPosition: index === 1 ? "55% center" : "center" }} />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(12,16,30,.02)_25%,rgba(12,16,30,.85)_100%)] transition group-hover:bg-[linear-gradient(180deg,rgba(12,16,30,.12)_10%,rgba(12,16,30,.92)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/65">0{index + 1}</p>
              <h3 className="mt-2 font-display text-2xl tracking-[-.045em]">{category.name}</h3>
              <div className="mt-3 grid grid-rows-[0fr] overflow-hidden transition-all duration-500 group-hover:grid-rows-[1fr]"><p className="min-h-0 text-xs leading-5 text-white/75">{category.detail}</p></div>
              <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em]">Discover <Icon name="arrow" className="h-4 w-4 fill-none stroke-current stroke-2 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>

{/* Editor's picks */}
    <section className="relative overflow-hidden bg-canvas">
      <div className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
        <SectionHeader kicker="Handpicked for you" title="This week's picks">A small curation of the pieces our customers keep coming back to.</SectionHeader>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {picks.map((item) => (
            <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_22px_rgba(23,32,51,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(23,32,51,.12)]" key={item.id}>
              <Link href={`/products/${item.id}`} className="relative block aspect-[1/0.85] overflow-hidden rounded-xl bg-slate-100">
                <span className="block h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${item.image})` }} />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-brand shadow-sm backdrop-blur">{item.tag}</span>
              </Link>
              <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
                <Stars rating={item.rating} />
                <h3 className="mt-2 font-display text-lg font-semibold tracking-[-.03em]"><Link className="hover:text-brand" href={`/products/${item.id}`}>{item.name}</Link></h3>
                <p className="mt-auto flex items-baseline gap-2 pt-3">
                  <span className="text-sm font-bold text-brand-deep">{currency.format(item.price)}</span>
                  {item.oldPrice > 0 && <span className="text-xs text-slate-400 line-through">{currency.format(item.oldPrice)}</span>}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* Brand story */}
    <section className="relative isolate overflow-hidden bg-[#20223d] text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(76,66,216,.35),transparent_55%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-28">
        <div className="relative">
          <div className="aspect-[4/4.4] overflow-hidden rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,.35)]">
            <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85')" }} />
          </div>
          <div className="absolute -bottom-6 -right-4 max-w-[200px] rounded-2xl bg-white p-5 text-[#172033] shadow-[0_20px_45px_rgba(0,0,0,.25)] sm:-right-8">
            <p className="font-display text-3xl font-semibold tracking-[-.05em] text-brand">Since 2026</p>
            <p className="mt-1 text-[11px] leading-4 text-slate-600">designed with purpose, made to be kept</p>
          </div>
        </div>
        <div>
          <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[.2em] text-[#b9b5ff]"><span className="h-px w-7 bg-[#8f89ff]" />Our philosophy</p>
          <h2 className="mt-4 max-w-md font-display text-4xl font-semibold leading-[1.02] tracking-[-.055em] sm:text-5xl">Quiet design,<br />made to last.</h2>
          <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300">We work with a small circle of makers who care about the same things we do — honest materials, considered proportions, and details that only improve with age.</p>
          <ul className="mt-8 grid gap-4">
            {craft.map((point) => (
              <li className="flex items-start gap-3 text-sm text-slate-200" key={point}>
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-white"><Icon name="check" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.4]" /></span>{point}
              </li>
            ))}
          </ul>
          <Link className="group mt-10 inline-flex items-center gap-3 rounded-full bg-brand px-6 py-3.5 text-xs font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,.28)] transition duration-300 hover:-translate-y-1 hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href="/new-arrivals">Browse new arrivals <Icon name="arrow" className="h-4 w-4 fill-none stroke-current stroke-2 transition-transform group-hover:translate-x-1" /></Link>
        </div>
      </div>
    </section>

    {/* Testimonial + stats */}
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-8 lg:px-10 lg:pb-28">
      <div className="grid gap-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(23,32,51,.06)] sm:p-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,.7fr)] lg:gap-14 lg:p-14">
        <figure>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-light text-brand"><Icon name="quote" className="h-6 w-6 fill-current" /></span>
          <blockquote className="mt-6 max-w-2xl font-display text-2xl font-medium leading-snug tracking-[-.03em] text-[#172033] sm:text-3xl">“The lamp my whole apartment now revolves around. Thoughtful, well-made, and worth more than every cent.”</blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#20223d] text-xs font-bold text-white">AV</span>
            <span><strong className="block text-sm text-slate-800">Amara V.</strong><span className="block text-xs text-slate-500">Verified buyer · Home &amp; Living</span></span>
          </figcaption>
        </figure>
        <dl className="grid content-start gap-8 border-t border-slate-200 pt-8 sm:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0 sm:pt-8">
          {stats.map((stat) => (
            <div key={stat.label}><dt className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">{stat.label}</dt><dd className="mt-1 font-display text-4xl font-semibold tracking-[-.05em] text-brand">{stat.value}</dd></div>
          ))}
        </dl>
      </div>
    </section>

    {/* Newsletter CTA */}
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10 lg:pb-28">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#20223d] px-7 py-16 text-center text-white shadow-[0_30px_70px_rgba(32,34,61,.28)] sm:px-14 lg:py-20">
        <div className="absolute -left-24 -top-28 -z-10 h-72 w-72 rounded-full bg-brand/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 -z-10 h-80 w-80 rounded-full bg-[#7b8cff]/25 blur-3xl" />
        <p className="flex items-center justify-center gap-2.5 text-[10px] font-bold uppercase tracking-[.2em] text-[#b9b5ff]"><span className="h-px w-7 bg-[#8f89ff]" />Stay in the loop <span className="h-px w-7 bg-[#8f89ff]" /></p>
        <h2 className="mx-auto mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.02] tracking-[-.055em] sm:text-5xl">Get the good stuff, first.</h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-300">New arrivals, studio notes, and subscriber-only offers — sent rarely, worth reading always.</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link className="group inline-flex items-center gap-3 rounded-full bg-brand px-7 py-3.5 text-xs font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,.28)] transition duration-300 hover:-translate-y-1 hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href="/register"><Icon name="mail" className="h-4 w-4 fill-none stroke-current stroke-2" />Join the list</Link>
          <Link className="rounded-full border border-white/35 px-7 py-3.5 text-xs font-bold text-white transition hover:border-white hover:bg-white/10" href="/products">Explore first</Link>
        </div>
        <p className="mt-5 text-[11px] text-slate-400">No spam. Unsubscribe anytime.</p>
      </div>
    </section>

    <SiteFooter />
  </main>;
}