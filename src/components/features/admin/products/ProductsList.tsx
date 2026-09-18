"use client";

/* Product image URLs are backend-controlled. */
/* eslint-disable @next/next/no-img-element */

import { addToast } from "@heroui/toast";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ApiResponse, Product as ApiProduct, ProductPage } from "@/types/product";

type Product = {
  id: number;
  name: string;
  sku: string;
  image: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  status: "Active" | "Draft" | "Archived";
  sold: number;
};

type DeleteResult = { id: number; name: string; error?: string };

const categories = ["Electronics", "Fashion", "Home & Office", "Accessories"];
const statusClass = {
  Active: "bg-green-100 text-green-700",
  Draft: "bg-gray-100 text-gray-600",
  Archived: "bg-red-100 text-red-700",
};
const sortOptions = ["Newest", "Price Low-High", "Price High-Low", "Best Selling", "Name A-Z"];
const money = (value: number) => `$${value.toFixed(2)}`;

function Pagination({ page, pages, rows, total, setPage, setRows }: {
  page: number;
  pages: number;
  rows: number;
  total: number;
  setPage: (page: number) => void;
  setRows: (rows: number) => void;
}) {
  const firstPage = Math.min(Math.max(0, page - 3), Math.max(0, pages - 8));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-5 py-3 text-sm text-slate-500 shadow-sm">
      <span>Showing {total ? page * rows + 1 : 0}-{Math.min((page + 1) * rows, total)} of {total} products</span>
      <div className="flex items-center gap-2">
        <select aria-label="Products per page" value={rows} onChange={(e) => { setRows(Number(e.target.value)); setPage(0); }} className="rounded-md border border-gray-200 px-2 py-1.5 text-xs text-slate-600">
          {[8, 10, 20, 50, 100].map((value) => <option key={value} value={value}>{value} per page</option>)}
        </select>
        <button aria-label="Previous page" disabled={!page} onClick={() => setPage(page - 1)} className="rounded-md border border-gray-200 p-1.5 text-slate-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: Math.min(pages, 8) }, (_, index) => firstPage + index).map((pageNumber) => (
          <button key={pageNumber} onClick={() => setPage(pageNumber)} aria-current={pageNumber === page ? "page" : undefined} className={`h-8 w-8 rounded-md text-xs transition-colors ${pageNumber === page ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}>
            {pageNumber + 1}
          </button>
        ))}
        <button aria-label="Next page" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="rounded-md border border-gray-200 p-1.5 text-slate-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [stock, setStock] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [view, setView] = useState<"table" | "grid">("grid");
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(8);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState<DeleteResult[]>([]);
  const deletePending = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      try {
        const response = await fetch("/api/products?page=0&size=200", { signal: controller.signal });
        const data = await response.json() as ApiResponse<ProductPage> | { message?: string };
        if (!response.ok || !("payload" in data) || !data.payload) throw new Error(data.message ?? "Unable to load products.");
        if (controller.signal.aborted) return;
        setProducts(data.payload.content.map((product: ApiProduct) => ({
          id: product.productId,
          name: product.productName,
          sku: `SKU-${String(product.productId).padStart(4, "0")}`,
          image: product.image,
          category: product.category?.categoryName ?? "Uncategorized",
          price: product.price,
          salePrice: product.specialPrice > 0 && product.specialPrice < product.price ? product.specialPrice : undefined,
          stock: product.quantity,
          status: "Active" as const,
          sold: 0,
        })));
      } catch (cause) {
        if (!controller.signal.aborted) setLoadError(cause instanceof Error ? cause.message : "Unable to load products.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadProducts();
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => products
    .filter((p) =>
      (!query || `${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase())) &&
      (category === "All" || p.category === category) &&
      (status === "All" || p.status === status) &&
      (stock === "All" || (stock === "In Stock" && p.stock > 10) || (stock === "Low Stock" && p.stock > 0 && p.stock <= 10) || (stock === "Out of Stock" && p.stock === 0))
    )
    .sort((a, b) =>
      sort === "Price Low-High" ? (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
      : sort === "Price High-Low" ? (b.salePrice ?? b.price) - (a.salePrice ?? a.price)
      : sort === "Best Selling" ? b.sold - a.sold
      : sort === "Name A-Z" ? a.name.localeCompare(b.name)
      : b.id - a.id
    ), [products, query, category, status, stock, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / rows));
  const currentPage = Math.min(page, pages - 1);
  const visible = filtered.slice(currentPage * rows, currentPage * rows + rows);

  const toggle = (id: number) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const clearFilters = () => { setQuery(""); setCategory("All"); setStatus("All"); setStock("All"); setPage(0); };

  async function remove(ids: number[]) {
    if (deletePending.current) return;
    const targets = products.filter((product) => ids.includes(product.id));
    if (!targets.length) return;
    deletePending.current = true;
    setIsDeleting(true);
    setDeleteErrors([]);
    try {
      const results = await Promise.all(targets.map(async (product): Promise<DeleteResult> => {
        try {
          const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
          const data = await response.json().catch(() => null) as { success?: boolean; message?: string } | null;
          if (!response.ok || data?.success !== true) throw new Error(data?.message || "Unable to delete this product.");
          return { id: product.id, name: product.name };
        } catch (cause) {
          return { id: product.id, name: product.name, error: cause instanceof Error && cause.message ? cause.message : "Unable to delete this product." };
        }
      }));
      const deletedIds = new Set(results.filter((result) => !result.error).map((result) => result.id));
      const failures = results.filter((result) => result.error);
      if (deletedIds.size) {
        setProducts((current) => current.filter((product) => !deletedIds.has(product.id)));
        setSelected((current) => current.filter((id) => !deletedIds.has(id)));
      }
      setDeleteErrors(failures);
      if (!failures.length) {
        addToast({
          title: deletedIds.size === 1 ? "Product deleted successfully" : `${deletedIds.size} products deleted successfully`,
          description: targets.length === 1 ? `"${targets[0].name}" was removed from your catalog.` : "The selected products were removed from your catalog.",
          icon: <CheckCircle2 className="h-5 w-5" />,
          color: "success",
          severity: "success",
          variant: "solid",
          timeout: 4000,
          shouldShowTimeoutProgress: true,
        });
      } else {
        const partiallyDeleted = deletedIds.size > 0;
        addToast({
          title: partiallyDeleted
            ? `${deletedIds.size} deleted, ${failures.length} failed`
            : targets.length === 1 ? "Unable to delete product" : "Unable to delete selected products",
          description: failures.length === 1
            ? `"${failures[0].name}": ${failures[0].error}`
            : "The products that could not be deleted are still in the list. Review the details below and try again.",
          icon: <Trash2 className="h-5 w-5" />,
          endContent: <span className="text-xs">&times;</span>,
          color: partiallyDeleted ? "warning" : "danger",
          severity: partiallyDeleted ? "warning" : "danger",
          variant: "solid",
          timeout: 6000,
          shouldShowTimeoutProgress: true,
        });
      }
    } finally {
      deletePending.current = false;
      setIsDeleting(false);
    }
  }

  const allVisibleSelected = visible.length > 0 && visible.every((p) => selected.includes(p.id));

  return (
    <main className="min-h-screen bg-[#f8f9fb] p-6">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Products</h1>
            <p className="mt-1 text-sm text-slate-500">{products.length} products</p>
          </div>
          <Link href="/admin/products/create" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700">
            <Plus className="h-4 w-4" />Add Product
          </Link>
        </header>

        <section className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <label className="flex h-10 min-w-60 flex-1 items-center gap-2 rounded-md border border-gray-200 px-3 transition-colors focus-within:border-indigo-400 sm:max-w-80">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="Search products by name or SKU..." className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
          </label>
          <select aria-label="Filter by category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }} className="h-10 rounded-md border border-gray-200 px-3 text-sm text-slate-600 transition-colors focus:border-indigo-400 focus:outline-none">
            {["All", ...categories].map((option) => <option key={option}>{option}</option>)}
          </select>
          <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} className="h-10 rounded-md border border-gray-200 px-3 text-sm text-slate-600 transition-colors focus:border-indigo-400 focus:outline-none">
            {["All", "Active", "Draft", "Archived"].map((option) => <option key={option}>{option}</option>)}
          </select>
          <select aria-label="Filter by stock" value={stock} onChange={(e) => { setStock(e.target.value); setPage(0); }} className="h-10 rounded-md border border-gray-200 px-3 text-sm text-slate-600 transition-colors focus:border-indigo-400 focus:outline-none">
            {["All", "In Stock", "Low Stock", "Out of Stock"].map((option) => <option key={option}>{option}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-3">
            <div role="group" aria-label="View" className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
              <button aria-label="Table view" aria-pressed={view === "table"} onClick={() => setView("table")} className={`rounded-md p-1.5 transition-colors ${view === "table" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
                <List className="h-4 w-4" />
              </button>
              <button aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")} className={`rounded-md p-1.5 transition-colors ${view === "grid" ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
                <Grid2X2 className="h-4 w-4" />
              </button>
            </div>
            <select aria-label="Sort products" value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }} className="h-10 rounded-md border border-gray-200 px-3 text-sm text-slate-600 transition-colors focus:border-indigo-400 focus:outline-none">
              {sortOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
        </section>

        {loadError && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>
        )}

        {deleteErrors.length > 0 && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-semibold">Unable to delete {deleteErrors.length === 1 ? "this product" : "these products"}:</p>
            <ul className="mt-1 list-inside list-disc">
              {deleteErrors.map((result) => <li key={result.id}>{result.name}: {result.error}</li>)}
            </ul>
          </div>
        )}

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <b>{selected.length} selected</b>
            <button onClick={() => setSelected([])} className="rounded-md bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm transition-colors hover:text-slate-800" disabled={isDeleting}>Change Status</button>
            <button disabled={isDeleting} onClick={() => void remove(selected)} className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
              {isDeleting ? "Deleting..." : "Delete selected"}
            </button>
            <button aria-label="Clear selection" onClick={() => setSelected([])} disabled={isDeleting} className="ml-auto rounded-md p-1 text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-600 disabled:opacity-50">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="status" aria-label="Loading products">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="animate-pulse rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <div className="aspect-square w-full rounded-lg bg-slate-100" />
                <div className="mt-3 h-4 w-3/4 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-3 h-4 w-1/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : view === "table" ? (
          <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {visible.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="w-12 px-4 py-3"><input aria-label="Select all products on this page" type="checkbox" disabled={isDeleting} checked={allVisibleSelected} onChange={() => setSelected(allVisibleSelected ? [] : visible.map((p) => p.id))} /></th>
                      <th className="px-3 py-3">Image</th>
                      <th className="px-3 py-3">Product</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Price</th>
                      <th className="px-3 py-3">Stock</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((p) => (
                      <tr key={p.id} className="border-t border-gray-100 transition-colors hover:bg-slate-50/70">
                        <td className="px-4 py-3"><input aria-label={`Select ${p.name}`} type="checkbox" disabled={isDeleting} checked={selected.includes(p.id)} onChange={() => toggle(p.id)} /></td>
                        <td className="px-3 py-3"><img className="h-10 w-10 rounded-lg object-cover" src={p.image} alt="" /></td>
                        <td className="px-3 py-3"><p className="font-semibold text-slate-700">{p.name}</p><small className="text-slate-400">{p.sku}</small></td>
                        <td className="px-3 py-3 text-slate-500">{p.category}</td>
                        <td className="px-3 py-3">
                          {p.salePrice && <span className="mr-2 text-xs text-slate-400 line-through">{money(p.price)}</span>}
                          <span className="font-semibold text-slate-700">{money(p.salePrice ?? p.price)}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-slate-600">
                            <i className={`h-2 w-2 rounded-full ${p.stock > 10 ? "bg-green-500" : p.stock ? "bg-amber-400" : "bg-red-500"}`} />
                            {p.stock || "Out"}
                          </span>
                        </td>
                        <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[p.status]}`}>{p.status}</span></td>
                        <td className="px-3 py-3 text-slate-500">{p.sold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400">No products found.<button onClick={clearFilters} className="ml-2 font-medium text-indigo-600 hover:text-indigo-700">Clear filters</button></div>
            )}
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => (
              <article key={p.id} className="group relative flex flex-col rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md">
                <input aria-label={`Select ${p.name}`} type="checkbox" disabled={isDeleting} checked={selected.includes(p.id)} onChange={() => toggle(p.id)} className="absolute left-5 top-5 z-10" />
                <div className="overflow-hidden rounded-lg">
                  <img className="aspect-square w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105" src={p.image} alt="" />
                </div>
                <div className="mt-3">
                  <p className="truncate text-sm font-semibold text-slate-700">{p.name}</p>
                  <small className="text-slate-400">{p.category}</small>
                </div>
                <p className="mt-2 font-bold text-slate-800">{money(p.salePrice ?? p.price)}{p.salePrice && <span className="ml-2 text-xs font-normal text-slate-400 line-through">{money(p.price)}</span>}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass[p.status]}`}>{p.status}</span>
                  <span className="text-xs text-slate-500">{p.stock} in stock</span>
                </div>
                <div className="mt-3 flex justify-end gap-3 border-t border-gray-100 pt-3">
                  <Link aria-label={`Edit ${p.name}`} href={`/admin/products/${p.id}/edit`} className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800">
                    <Pencil className="h-4 w-4" />Edit
                  </Link>
                  <button aria-label={`Delete ${p.name}`} disabled={isDeleting} onClick={() => void remove([p.id])} className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 transition-colors hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50">
                    <Trash2 className="h-4 w-4" />Delete
                  </button>
                </div>
              </article>
            ))}
            {visible.length === 0 && (
              <div className="col-span-full rounded-xl border border-gray-100 bg-white py-20 text-center text-slate-400">No products found.<button onClick={clearFilters} className="ml-2 font-medium text-indigo-600 hover:text-indigo-700">Clear filters</button></div>
            )}
          </section>
        )}

        <Pagination page={currentPage} pages={pages} rows={rows} total={filtered.length} setPage={setPage} setRows={setRows} />
      </div>
    </main>
  );
}