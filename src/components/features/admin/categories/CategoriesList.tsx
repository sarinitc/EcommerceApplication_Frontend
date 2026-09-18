"use client";

import { addToast } from "@heroui/toast";
import {
  ArrowUp,
  ArrowUpDown,
  ArrowDown,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Gem,
  GraduationCap,
  Home,
  Laptop,
  Laptop2,
  type LucideIcon,
  Package,
  Pencil,
  Plus,
  Search,
  Shirt,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

type AdminCategory = {
  categoryId: number | string;
  categoryName: string;
  productCount?: number;
};

type SortKey = "categoryName" | "categoryId";

function readCategories(data: unknown): AdminCategory[] {
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  const payload = record.payload ?? data;
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { content?: unknown }).content)
      ? (payload as { content: unknown[] }).content
      : [];
  return list.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const value = item as Record<string, unknown>;
    const name = typeof value.categoryName === "string" ? value.categoryName : typeof value.name === "string" ? value.name : null;
    if (!name?.trim()) return [];
    const id = typeof value.categoryId === "number" ? value.categoryId : typeof value.id === "number" ? value.id : String(value.categoryId ?? value.id ?? name);
    const productCount = typeof value.productCount === "number" ? value.productCount : typeof value.count === "number" ? value.count : undefined;
    return [{ categoryId: id, categoryName: name, productCount }];
  });
}

const categoryIcons: Record<string, LucideIcon> = {
  "Accessories": Gem,
  "Books": BookOpen,
  "Computer MacBook": Laptop2,
  "Electronics": Cpu,
  "Hight School": GraduationCap,
  "Home Appliances": Home,
  "Laptops": Laptop,
  "Men Fashion": Shirt,
};

const fallbackCategoryIcon = Package;

function categoryIcon(categoryName: string): LucideIcon {
  return categoryIcons[categoryName.trim()] ?? fallbackCategoryIcon;
}

function SortButton({ label, field, sortKey, direction, onSort }: { label: string; field: SortKey; sortKey: SortKey; direction: "asc" | "desc"; onSort: (field: SortKey) => void }) {
  const active = sortKey === field;
  const Icon = active ? direction === "asc" ? ArrowUp : ArrowDown : ArrowUpDown;
  return <button type="button" onClick={() => onSort(field)} className="inline-flex items-center gap-1.5 text-left transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">{label}<Icon className={`h-3.5 w-3.5 ${active ? "text-indigo-500" : "text-slate-300"}`} /></button>;
}

export function CategoriesList() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>("categoryName");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function reload(options?: { silent?: boolean }) {
    if (!options?.silent) setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/categories", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || `Category API returned HTTP ${response.status}.`);
      const loaded = readCategories(data);
      setCategories(loaded);
      return loaded;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to load categories.";
      setError(message);
      setCategories([]);
      return [] as AdminCategory[];
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch("/api/categories", { signal: controller.signal, cache: "no-store" });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.message || `Category API returned HTTP ${response.status}.`);
        if (!controller.signal.aborted) setCategories(readCategories(data));
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Unable to load categories.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories
      .filter((category) => !query || category.categoryName.toLowerCase().includes(query) || String(category.categoryId).toLowerCase().includes(query))
      .sort((first, second) => {
        const left = String(first[sortKey] ?? "").toLowerCase();
        const right = String(second[sortKey] ?? "").toLowerCase();
        return (left.localeCompare(right, undefined, { numeric: true }) || String(first.categoryId).localeCompare(String(second.categoryId), undefined, { numeric: true })) * (direction === "asc" ? 1 : -1);
      });
  }, [categories, direction, search, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const activePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(activePage * rowsPerPage, (activePage + 1) * rowsPerPage);
  const productCountCategories = categories.filter((category) => typeof category.productCount === "number").length;

  function updateSort(field: SortKey) {
    setPage(0);
    if (field === sortKey) setDirection((value) => value === "asc" ? "desc" : "asc");
    else { setSortKey(field); setDirection("asc"); }
  }

  function openCreate() {
    setFormError(null);
    setEditing({ categoryId: "" as unknown as number, categoryName: "" });
  }

  function openEdit(category: AdminCategory) {
    setFormError(null);
    setEditing(category);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    try {
      const id = editing && Number.isFinite(Number(editing.categoryId)) ? Number(editing.categoryId) : null;
      const response = await fetch(id ? `/api/categories/${id}` : "/api/categories", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: name }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || `Category API returned HTTP ${response.status}.`);
      await reload({ silent: true });
      setEditing(null);
      addToast({
        title: id ? "Category updated" : "Category created",
        description: `"${name}" ${id ? "was updated." : "was added to the catalog."}`,
        icon: <CheckCircle2 className="h-5 w-5" />,
        color: "success",
        severity: "success",
        variant: "solid",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
    } catch (cause) {
      setFormError(cause instanceof Error && cause.message ? cause.message : "Unable to save the category.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || !Number.isFinite(Number(deleteTarget.categoryId))) return;
    const target = deleteTarget;
    const id = Number(target.categoryId);
    setDeleteTarget(null);
    try {
      const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) {
        addToast({
          title: "Unable to delete category",
          description: data?.message || `Category API returned HTTP ${response.status}.`,
          icon: <Trash2 className="h-5 w-5" />,
          color: "danger",
          severity: "danger",
          variant: "solid",
          timeout: 6000,
          shouldShowTimeoutProgress: true,
        });
        return;
      }
      setCategories((current) => current.filter((category) => Number(category.categoryId) !== id));
      addToast({
        title: "Category deleted successfully",
        description: `"${target.categoryName}" was removed from the catalog.`,
        icon: <CheckCircle2 className="h-5 w-5" />,
        color: "success",
        severity: "success",
        variant: "solid",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
    } catch {
      addToast({
        title: "Unable to delete category",
        description: "The category API could not be reached. Please try again.",
        icon: <Trash2 className="h-5 w-5" />,
        color: "danger",
        severity: "danger",
        variant: "solid",
        timeout: 6000,
        shouldShowTimeoutProgress: true,
      });
    }
  }

  const isEditing = Boolean(editing && Number.isFinite(Number(editing.categoryId)));

  const form = editing && (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <form onSubmit={saveCategory} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">Catalog management</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{isEditing ? "Edit category" : "Add category"}</h2>
            <p className="mt-1 text-sm text-slate-500">{isEditing ? `Update "${editing.categoryName}" in the catalog.` : "Create a new category for your products."}</p>
          </div>
          <button type="button" onClick={() => setEditing(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close category form"><X className="h-5 w-5" /></button>
        </div>
        <label className="mt-6 block">
          <span className="text-xs font-semibold text-slate-600">Category name</span>
          <input name="name" required autoFocus defaultValue={isEditing ? editing.categoryName : ""} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" placeholder="e.g. Electronics" />
        </label>
        {formError && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : isEditing ? "Save changes" : "Create category"}</button>
        </div>
      </form>
    </div>
  );

  return (
    <main className="min-h-screen space-y-6 bg-[#f8f9fc] p-5 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500">Catalog management</p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">Categories</h1>
          <p className="mt-1.5 text-sm text-slate-500">Organize products into browsable collections.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500">{loading ? "Loading…" : `${categories.length} categories`}</span>
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"><Plus className="h-4 w-4" />Add category</button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-px hover:border-indigo-200 hover:shadow-md"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Tags className="h-5 w-5" /></span><span><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Total categories</p><p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">{categories.length}</p><p className="text-xs text-slate-500">Live from the catalog</p></span></article>
        <article className="group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-px hover:border-emerald-200 hover:shadow-md"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Search className="h-5 w-5" /></span><span><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Visible results</p><p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">{filtered.length}</p><p className="text-xs text-slate-500">After current search</p></span></article>
        <article className="group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-px hover:border-blue-200 hover:shadow-md"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><CheckCircle2 className="h-5 w-5" /></span><span><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Product coverage</p><p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">{productCountCategories}<span className="ml-1 text-sm font-medium text-slate-400">/ {categories.length}</span></p><p className="text-xs text-slate-500">Categories with counts</p></span></article>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-400 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-3 focus-within:ring-indigo-100 sm:w-80">
              <Search className="h-4 w-4 shrink-0" />
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" placeholder="Search categories by name or id…" aria-label="Search categories" />
            </label>
            {search && <button type="button" onClick={() => { setSearch(""); setPage(0); }} className="px-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800">Clear search</button>}
          </div>
          <span className="text-xs font-semibold text-slate-400">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
        </div>
      </section>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <section className="space-y-3" role="status" aria-label="Loading categories">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex animate-pulse items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-slate-100" />
                <div className="h-3 w-1/4 rounded bg-slate-100" />
              </div>
              <div className="h-8 w-20 rounded-lg bg-slate-100" />
            </div>
          ))}
        </section>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
          <Tags className="mx-auto h-8 w-8 text-indigo-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">{categories.length ? "No matching categories" : "No categories yet"}</p>
          <p className="mt-1 text-sm text-slate-500">{categories.length ? "Try adjusting your search." : "Create your first category to start organizing products."}</p>
          {!categories.length && <button type="button" onClick={openCreate} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"><Plus className="h-4 w-4" />Add category</button>}
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-800">All categories</h2><p className="mt-0.5 text-xs text-slate-400">Manage the collections used across your store.</p></div><span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">{totalPages} page{totalPages === 1 ? "" : "s"}</span></div>
          <div className="max-h-[min(62vh,640px)] overflow-auto">
          <table className="w-full min-w-140 text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 backdrop-blur">
              <tr className="border-b border-slate-200">
                <th className="w-[44%] px-5 py-3"><SortButton label="Category" field="categoryName" sortKey={sortKey} direction={direction} onSort={updateSort} /></th>
                <th className="px-5 py-3"><SortButton label="ID" field="categoryId" sortKey={sortKey} direction={direction} onSort={updateSort} /></th>
                <th className="px-5 py-3">Products</th>
                <th className="w-28 px-3 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((category) => (
                <tr key={String(category.categoryId)} className="group transition-colors hover:bg-indigo-50/30">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {(() => { const CategoryIcon = categoryIcon(category.categoryName); return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100"><CategoryIcon className="h-5 w-5" /></span>; })()}
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-slate-800">{category.categoryName}</span>
                        <span className="block text-xs text-slate-400">#{category.categoryId}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{String(category.categoryId)}</td>
                  <td className="px-5 py-3.5">
                    {typeof category.productCount === "number"
                      ? <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{category.productCount} product{category.productCount === 1 ? "" : "s"}</span>
                      : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-100 transition group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <button type="button" onClick={() => openEdit(category)} aria-label={`Edit ${category.categoryName}`} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"><Pencil className="h-4 w-4" />Edit</button>
                      <button type="button" onClick={() => setDeleteTarget(category)} aria-label={`Delete ${category.categoryName}`} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"><Trash2 className="h-4 w-4" />Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      )}

      {filtered.length > 0 && (
        <div className="flex justify-center rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <label className="font-medium" htmlFor="category-page-size">Rows per page</label>
            <select id="category-page-size" value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
              {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <button type="button" aria-label="Previous page" disabled={activePage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} className="ml-1 grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: totalPages }, (_, pageNumber) => <button type="button" key={pageNumber} onClick={() => setPage(pageNumber)} aria-current={pageNumber === activePage ? "page" : undefined} className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-semibold transition ${pageNumber === activePage ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}`}>{pageNumber + 1}</button>)}
            <button type="button" aria-label="Next page" disabled={activePage === totalPages - 1} onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm" role="presentation">
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-category-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600"><Trash2 className="h-5 w-5" /></div>
            <h2 id="delete-category-title" className="mt-4 text-lg font-bold text-slate-900">Delete this category?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">This will permanently remove <b className="text-slate-700">{deleteTarget.categoryName}</b> from the catalog.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => void confirmDelete()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">Delete category</button>
            </div>
          </div>
        </div>
      )}

      {form}
    </main>
  );
}