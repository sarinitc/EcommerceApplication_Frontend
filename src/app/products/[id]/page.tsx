"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/src/components/cart/CartContext";
import type { ApiResponse, Product } from "@/src/lib/products";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const colorOptions = [
  { name: "Midnight indigo", className: "bg-[#212742]" },
  { name: "Graphite", className: "bg-[#dfd9ce]" },
  { name: "Clay", className: "bg-[#b17d5a]" },
  { name: "Cloud", className: "bg-[#e5e7eb]" },
];

const related = [
  { name: "Studio Sound Speaker", price: "$149.00", rating: "4.9", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=700&q=85" },
  { name: "Orbit Smart Lamp", price: "$98.00", rating: "4.7", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85" },
  { name: "Slate Mechanical Keyboard", price: "$129.00", rating: "4.8", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=85" },
  { name: "Field Camera", price: "$329.00", rating: "4.8", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=85" },
];

function Icon({ name, className = "" }: { name: "arrow" | "bag" | "check" | "chevron" | "minus" | "plus" | "search" | "star" | "user"; className?: string }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    bag: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    minus: <path d="M5 12h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>{paths[name]}</svg>;
}

function Stars({ rating }: { rating: string }) {
  return <span className="flex text-[#e3a52b]" aria-label={`${rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" className="h-4 w-4 fill-current stroke-current" />)}</span>;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { itemCount: bagCount, addItem } = useCart();
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].name);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const response = await fetch(`/api/products/${encodeURIComponent(id)}`, { signal: controller.signal });
        const data = await response.json() as ApiResponse<Product> | { message?: string };
        if (!response.ok || !("payload" in data)) throw new Error(data.message ?? "Unable to load this product.");
        setProduct(data.payload);
        setActiveImage(0);
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Unable to load this product.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadProduct();
    return () => controller.abort();
  }, [id]);

  if (isLoading) return <main className="grid min-h-screen place-items-center bg-[#f8f8f6] text-sm text-slate-500">Loading product…</main>;
  if (!product) return <main className="grid min-h-screen place-items-center bg-[#f8f8f6] px-5 text-center"><div><p className="text-sm text-red-700">{loadError ?? "Product not found."}</p><Link className="mt-4 inline-block font-semibold text-[#4f46d9]" href="/products">Back to products</Link></div></main>;

  const gallery = product.image ? [product.image] : [];
  const price = product.specialPrice || product.price;
  const stock = Math.max(0, product.quantity);
  return <main className="min-h-screen bg-[#f8f8f6] text-[#172033]">
    <header className="sticky top-0 z-30 border-b border-slate-900/5 bg-[#f8f8f6]/90 shadow-[0_8px_24px_rgba(23,32,51,.06)] backdrop-blur-xl"><div className="mx-auto flex h-[70px] max-w-7xl items-center px-5 sm:px-8 lg:px-10"><Link href="/" className="flex items-center gap-2.5 text-[#2720a7]"><span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-[#2720a7]"><span className="h-3.5 w-3.5 rotate-45 rounded-[3px] border border-white/80" /><span className="absolute h-2 w-2 rounded-full bg-[#b9b6ff]" /></span><span className="font-[Georgia,serif] text-xl font-bold tracking-[-.06em]">Indigo<span className="text-[#172033]">Store</span></span></Link><nav className="ml-12 hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[.14em] text-slate-500 md:flex"><Link className="relative py-2 text-[#2720a7] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-[#5049db]" href="/products">Shop</Link><Link className="hover:text-[#2720a7]" href="/deals">Deals</Link><Link className="hover:text-[#2720a7]" href="/new-arrivals">New arrivals</Link></nav><div className="ml-auto flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 p-1 shadow-[0_4px_14px_rgba(23,32,51,.05)]"><button className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-[#e9e8ff] hover:text-[#4f46d9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46d9]" aria-label="Search"><Icon name="search" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]" /></button><Link className="relative grid h-9 w-9 place-items-center rounded-full bg-[#eeecff] text-[#4038c8] transition hover:-translate-y-0.5 hover:bg-[#dedbff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46d9]" href="/cart" aria-label={`Shopping bag, ${bagCount} items`}><Icon name="bag" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]" /><span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full border-2 border-[#f8f8f6] bg-[#4f46d9] px-1 text-[8px] font-bold text-white">{bagCount}</span></Link><Link className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-[#e9e8ff] hover:text-[#4f46d9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46d9]" href="/profile" aria-label="Your profile"><Icon name="user" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]" /></Link></div></div></header>

    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb"><Link className="hover:text-[#4f46d9]" href="/">Home</Link><Icon name="chevron" className="h-3.5 w-3.5 fill-none stroke-current stroke-2 text-slate-300" /><Link className="hover:text-[#4f46d9]" href="/products">Products</Link><Icon name="chevron" className="h-3.5 w-3.5 fill-none stroke-current stroke-2 text-slate-300" /><span>{product.category?.categoryName ?? "Uncategorized"}</span><Icon name="chevron" className="h-3.5 w-3.5 fill-none stroke-current stroke-2 text-slate-300" /><span className="font-semibold text-slate-700">{product.productName}</span></nav>

      <section className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14"><div><div className="aspect-square overflow-hidden rounded-3xl bg-[#eef0f2] shadow-[0_18px_40px_rgba(23,32,51,.10)]"><div className="h-full w-full bg-cover bg-center transition-opacity duration-200" style={{ backgroundImage: `url(${gallery[activeImage]})` }} /></div><div className="mt-4 grid grid-cols-4 gap-3">{gallery.map((image, index) => <button className={`aspect-square overflow-hidden rounded-xl bg-slate-100 p-0.5 transition ${index === activeImage ? "ring-2 ring-[#5049db] ring-offset-2 ring-offset-[#f8f8f6]" : "border border-slate-200 hover:border-[#aaa5ff]"}`} key={image} aria-label={`View product image ${index + 1}`} aria-pressed={index === activeImage} onClick={() => setActiveImage(index)}><span className="block h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} /></button>)}</div></div>
        <div className="lg:pt-4"><span className="inline-flex rounded-full bg-[#e9e8ff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#4841cb]">Available now</span><h1 className="mt-5 max-w-xl font-[Georgia,serif] text-4xl font-semibold leading-[1.02] tracking-[-.06em] text-[#172033] sm:text-5xl">{product.productName}</h1><div className="mt-5 flex items-center gap-2"><Stars rating="New" /><span className="text-sm font-bold text-slate-700">New</span></div><div className="mt-6 flex items-baseline gap-3"><span className="text-3xl font-bold tracking-[-.04em] text-[#332dac]">{currency.format(price)}</span>{product.specialPrice > 0 && product.specialPrice < product.price && <><span className="text-base text-slate-400 line-through">{currency.format(product.price)}</span><span className="rounded-full bg-[#fff0e8] px-2.5 py-1 text-[10px] font-bold text-[#b44a1b]">On sale</span></>}</div><p className="mt-6 max-w-xl text-[15px] leading-7 text-slate-600">{product.description}</p><div className="my-7 border-t border-slate-200" />
          <div><p className="text-sm font-bold text-slate-800">Color <span className="ml-2 font-normal text-slate-500" aria-live="polite">{selectedColor}</span></p><div className="mt-3 flex gap-3" role="radiogroup" aria-label="Choose a color">{colorOptions.map((color) => <button className={`h-8 w-8 rounded-full ${color.className} transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#5049db] ${selectedColor === color.name ? "ring-2 ring-[#5049db] ring-offset-3 ring-offset-[#f8f8f6]" : "ring-1 ring-slate-300 ring-offset-2"}`} key={color.name} aria-label={color.name} aria-checked={selectedColor === color.name} onClick={() => setSelectedColor(color.name)} role="radio" type="button" />)}</div></div>
          <div className="mt-8 flex flex-wrap items-center gap-4"><div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white"><button className="grid h-full w-10 place-items-center text-slate-500 transition hover:text-[#4f46d9] disabled:cursor-not-allowed disabled:opacity-35" aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))}><Icon name="minus" className="h-4 w-4 fill-none stroke-current stroke-2" /></button><span className="grid h-full w-9 place-items-center text-sm font-bold" aria-live="polite">{quantity}</span><button className="grid h-full w-10 place-items-center text-slate-500 transition hover:text-[#4f46d9] disabled:cursor-not-allowed disabled:opacity-35" aria-label="Increase quantity" disabled={quantity >= stock} onClick={() => setQuantity((current) => Math.min(stock, current + 1))}><Icon name="plus" className="h-4 w-4 fill-none stroke-current stroke-2" /></button></div><span className={`inline-flex items-center gap-2 text-sm font-semibold ${stock > 0 ? "text-[#24865b]" : "text-red-600"}`}><span className={`h-2 w-2 rounded-full ${stock > 0 ? "bg-[#34a977]" : "bg-red-500"}`} />{stock > 0 ? `${stock} in stock · ready to ship` : "Out of stock"}</span></div>
          <div className="mt-7 grid grid-cols-2 gap-3"><button disabled={stock === 0} className="rounded-xl bg-[#4f46d9] px-4 py-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(79,70,217,.25)] transition hover:-translate-y-0.5 hover:bg-[#4038c8] disabled:cursor-not-allowed disabled:opacity-50" onClick={() => { addItem({ id: product.productId, name: product.productName, variant: selectedColor, price, stock, image: product.image }, quantity); router.push("/cart"); }}>Add to Cart</button><button disabled={stock === 0} className="rounded-xl bg-[#c85d2c] px-4 py-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(200,93,44,.22)] transition hover:-translate-y-0.5 hover:bg-[#ae4d21] disabled:cursor-not-allowed disabled:opacity-50" onClick={() => { addItem({ id: product.productId, name: product.productName, variant: selectedColor, price, stock, image: product.image }, quantity); router.push("/checkout"); }}>Buy Now</button></div>
        </div></section>

      <section className="mt-20"><div className="flex gap-7 border-b border-slate-200 text-sm font-semibold text-slate-500"><button className="relative -mb-px border-b-2 border-[#4f46d9] px-1 pb-4 text-[#4038c8]">Features</button><button className="px-1 pb-4 hover:text-[#4038c8]">Specifications</button><button className="px-1 pb-4 hover:text-[#4038c8]" id="reviews">Reviews</button></div><div className="mt-10 grid items-center gap-10 rounded-3xl bg-white p-7 shadow-[0_12px_30px_rgba(23,32,51,.06)] lg:grid-cols-2 lg:p-10"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#5c56d3]">Made for immersion</p><h2 className="mt-3 font-[Georgia,serif] text-3xl font-semibold tracking-[-.05em]">Immersive sound quality</h2><p className="mt-5 max-w-lg text-sm leading-7 text-slate-600">Every detail is tuned to bring you closer to the music. Our custom acoustic architecture creates an expansive soundstage with warmth, precision, and presence.</p><ul className="mt-6 grid gap-4">{["Adaptive noise cancellation that learns your environment", "40 hours of uninterrupted listening with the charging case", "Comfort-fit memory foam ear cushions for all-day wear"].map((feature) => <li className="flex items-start gap-3 text-sm text-slate-700" key={feature}><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e9e8ff] text-[#4f46d9]"><Icon name="check" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.4]" /></span>{feature}</li>)}</ul></div><div className="min-h-[300px] overflow-hidden rounded-2xl bg-slate-100 shadow-[0_12px_25px_rgba(23,32,51,.10)]"><div className="h-full min-h-[300px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85')" }} /></div></div></section>

      <section className="pb-4 pt-20"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#5c56d3]">Complete the set</p><h2 className="mt-3 font-[Georgia,serif] text-4xl font-semibold tracking-[-.055em]">Related Products</h2></div><Link className="hidden items-center gap-1 text-sm font-bold text-[#4f46d9] hover:text-[#322ba9] sm:inline-flex" href="/products">View all <Icon name="arrow" className="h-4 w-4 fill-none stroke-current stroke-2" /></Link></div><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((item, index) => <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_22px_rgba(23,32,51,.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(23,32,51,.12)]" key={item.name}><Link href={`/products/${index + 2}`} className="block aspect-[1/0.85] overflow-hidden rounded-xl bg-slate-100"><span className="block h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${item.image})` }} /></Link><div className="px-1 pb-1 pt-4"><div className="flex items-center gap-1.5"><Stars rating={item.rating} /><span className="text-[11px] text-slate-500">{item.rating}</span></div><h3 className="mt-2 font-[Georgia,serif] text-lg font-semibold tracking-[-.03em]"><Link className="hover:text-[#4f46d9]" href={`/products/${index + 2}`}>{item.name}</Link></h3><p className="mt-2 text-sm font-bold text-[#332dac]">{item.price}</p></div></article>)}</div></section>
    </div>
    <footer className="border-t border-slate-200 bg-[#ebedf0]"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><Link href="/" className="font-[Georgia,serif] text-lg font-bold tracking-[-.05em] text-[#2720a7]">Indigo<span className="text-[#172033]">Store</span></Link><span>© 2026 IndigoStore. All rights reserved.</span></div></footer>
  </main>;
}
