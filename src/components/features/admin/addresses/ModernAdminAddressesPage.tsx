"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, Building2, CheckCircle2, ChevronLeft, ChevronRight, Globe2, MapPin, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { StatCard } from "../StatCard";
import { FilterDropdown } from "../customers/FilterDropdown";

type AdminAddress = {
  addressId?: number | string;
  customerName?: string;
  street?: string;
  buildingName?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
};

type SortKey = "street" | "city" | "state" | "country" | "pincode";
const pageSize = 7;

function addressPayload(form: HTMLFormElement) {
  const data = new FormData(form);
  return {
    street: String(data.get("street") ?? "").trim(),
    buildingName: String(data.get("buildingName") ?? "").trim() || undefined,
    city: String(data.get("city") ?? "").trim(),
    state: String(data.get("state") ?? "").trim() || undefined,
    country: String(data.get("country") ?? "").trim(),
    pincode: String(data.get("pincode") ?? "").trim(),
  };
}

function SortButton({ label, field, sortKey, direction, onSort }: { label: string; field: SortKey; sortKey: SortKey; direction: "asc" | "desc"; onSort: (field: SortKey) => void }) {
  const active = sortKey === field;
  const Icon = active ? direction === "asc" ? ArrowUp : ArrowDown : ArrowUpDown;
  return <button type="button" onClick={() => onSort(field)} className="inline-flex items-center gap-1.5 text-left transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">{label}<Icon className={`h-3.5 w-3.5 ${active ? "text-indigo-500" : "text-slate-300"}`} /></button>;
}

export function ModernAdminAddressesPage() {
  const [addresses, setAddresses] = useState<AdminAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [state, setState] = useState("all");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("street");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [menuId, setMenuId] = useState<number | string | null>(null);
  const [editing, setEditing] = useState<AdminAddress | null>(null);
  const [viewing, setViewing] = useState<AdminAddress | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAddress | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/addresses", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.message || `Address API returned HTTP ${response.status}.`);
        const payload = data?.payload;
        const list = Array.isArray(payload) ? payload : Array.isArray(payload?.content) ? payload.content : Array.isArray(data) ? data : [];
        setAddresses(list);
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        const message = cause instanceof Error ? cause.message : "";
        if (/HTTP (401|403)/.test(message) || /sign in|Administrator/i.test(message)) setError(message || "You are not authorized to view addresses.");
        else setError(message || "Unable to load addresses from the database.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const countries = useMemo(() => [...new Set(addresses.map((address) => address.country).filter((value): value is string => Boolean(value)))].sort(), [addresses]);
  const states = useMemo(() => [...new Set(addresses.map((address) => address.state).filter((value): value is string => Boolean(value)))].sort(), [addresses]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return addresses.filter((address) => {
      const matchesSearch = !query || [address.street, address.buildingName, address.city, address.state, address.country, address.pincode, address.customerName].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
      return matchesSearch && (country === "all" || address.country === country) && (state === "all" || address.state === state);
    }).sort((first, second) => {
      const left = String(first[sortKey] ?? "").toLowerCase();
      const right = String(second[sortKey] ?? "").toLowerCase();
      return (left.localeCompare(right, undefined, { numeric: true }) || Number(first.addressId ?? 0) - Number(second.addressId ?? 0)) * (direction === "asc" ? 1 : -1);
    });
  }, [addresses, country, direction, search, sortKey, state]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(activePage * pageSize, (activePage + 1) * pageSize);

  function updateSort(field: SortKey) {
    setPage(0);
    if (field === sortKey) setDirection((value) => value === "asc" ? "desc" : "asc");
    else { setSortKey(field); setDirection("asc"); }
  }

  function clearFilters() { setSearch(""); setCountry("all"); setState("all"); setPage(0); }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setFormError(null);
    const body = addressPayload(event.currentTarget);
    try {
      const id = editing?.addressId;
      const response = await fetch(id ? `/api/addresses/${encodeURIComponent(String(id))}` : "/api/addresses", { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || `Address API returned HTTP ${response.status}.`);
      const saved = data?.payload ?? { ...body, addressId: id ?? Date.now() };
      setAddresses((current) => id ? current.map((address) => address.addressId === id ? { ...address, ...saved } : address) : [...current, saved]);
      setEditing(null); setSaving(false);
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : "Unable to save address."); setSaving(false); }
  }

  async function deleteAddress(address: AdminAddress) {
    if (!address.addressId) return;
    setDeleteTarget(address);
    setMenuId(null);
  }

  async function confirmDelete() {
    if (!deleteTarget?.addressId) return;
    const address = deleteTarget;
    setDeleteTarget(null);
    try {
      const response = await fetch(`/api/addresses/${encodeURIComponent(String(address.addressId))}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => null) as { message?: string } | null;
        setToast({ type: "error", message: data?.message || `Unable to delete address (HTTP ${response.status}).` });
        return;
      }
      setAddresses((current) => current.filter((item) => item.addressId !== address.addressId));
      setToast({ type: "success", message: "Address deleted successfully." });
    } catch {
      setToast({ type: "error", message: "The address service could not be reached." });
    }
  }

  const form = editing && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm"><form onSubmit={saveAddress} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">Address record</p><h2 className="mt-1 text-xl font-bold text-slate-900">{editing.addressId ? "Edit address" : "Add address"}</h2></div><button type="button" onClick={() => setEditing(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close address form"><X className="h-5 w-5" /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2"><span className="text-xs font-semibold text-slate-600">Street address</span><input name="street" required defaultValue={editing.street} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></label><label><span className="text-xs font-semibold text-slate-600">Building</span><input name="buildingName" defaultValue={editing.buildingName} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></label><label><span className="text-xs font-semibold text-slate-600">City</span><input name="city" required defaultValue={editing.city} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></label><label><span className="text-xs font-semibold text-slate-600">State / Province</span><input name="state" defaultValue={editing.state} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></label><label><span className="text-xs font-semibold text-slate-600">Postal code</span><input name="pincode" required defaultValue={editing.pincode} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></label><label className="sm:col-span-2"><span className="text-xs font-semibold text-slate-600">Country</span><input name="country" required defaultValue={editing.country || "Cambodia"} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100" /></label></div>{formError && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">{formError}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60">{saving ? "Saving…" : "Save address"}</button></div></form></div>;

  return <main className="min-h-screen space-y-6 bg-[#f8f9fc] p-5 sm:p-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500">Customer directory</p><h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">Addresses</h1><p className="mt-1.5 text-sm text-slate-500">Manage and review customer delivery locations.</p></div><div className="flex items-center gap-3"><span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500">{loading ? "Loading…" : `${addresses.length} addresses`}</span><button type="button" onClick={() => { setFormError(null); setEditing({}); }} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"><Plus className="h-4 w-4" />Add address</button></div></header>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"><StatCard icon={MapPin} iconBg="bg-indigo-50 text-indigo-600" label="Total addresses" value={String(addresses.length)} subtitle="All saved addresses" /><StatCard icon={Globe2} iconBg="bg-emerald-50 text-emerald-600" label="Countries" value={String(countries.length)} subtitle={`${countries.length} active ${countries.length === 1 ? "country" : "countries"}`} /><StatCard icon={Building2} iconBg="bg-blue-50 text-blue-600" label="States / provinces" value={String(states.length)} subtitle={`${states.length} unique regions`} /></div>

    <section className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-400 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-3 focus-within:ring-indigo-100 sm:w-80"><Search className="h-4 w-4 shrink-0" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" placeholder="Search address, city, state, postal code…" aria-label="Search addresses" /></label><FilterDropdown label="Country" value={country} onChange={(value) => { setCountry(value); setPage(0); }} options={countries} /><FilterDropdown label="State / Province" value={state} onChange={(value) => { setState(value); setPage(0); }} options={states} />{(search || country !== "all" || state !== "all") && <button type="button" onClick={clearFilters} className="px-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800">Clear filters</button>}</div><span className="text-xs font-semibold text-slate-400">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span></div></section>

    {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div> : loading ? <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-500 shadow-sm">Loading addresses…</div> : filtered.length === 0 ? <div className="rounded-2xl bg-white p-12 text-center shadow-sm"><MapPin className="mx-auto h-8 w-8 text-indigo-300" /><p className="mt-3 text-sm font-semibold text-slate-700">No matching addresses</p><p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p></div> : <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]"><div className="max-h-[min(62vh,640px)] overflow-auto"><table className="w-full min-w-225 text-sm"><thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 backdrop-blur"><tr className="border-b border-slate-200"><th className="w-[38%] px-5 py-3"> <SortButton label="Address" field="street" sortKey={sortKey} direction={direction} onSort={updateSort} /></th><th className="px-5 py-3"><SortButton label="City" field="city" sortKey={sortKey} direction={direction} onSort={updateSort} /></th><th className="px-5 py-3"><SortButton label="State / Province" field="state" sortKey={sortKey} direction={direction} onSort={updateSort} /></th><th className="px-5 py-3"><SortButton label="Country" field="country" sortKey={sortKey} direction={direction} onSort={updateSort} /></th><th className="px-5 py-3"><SortButton label="Postal code" field="pincode" sortKey={sortKey} direction={direction} onSort={updateSort} /></th><th className="w-14 px-3 py-3"><span className="sr-only">Actions</span></th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((address, index) => { const id = address.addressId ?? index; return <tr key={String(id)} className="group transition-colors hover:bg-indigo-50/30"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><MapPin className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{address.street || "Address unavailable"}{address.buildingName ? <span className="font-normal text-slate-400">, {address.buildingName}</span> : null}</p>{address.customerName && <p className="mt-0.5 truncate text-xs text-slate-400">{address.customerName}</p>}</div></div></td><td className="px-5 py-3.5 text-slate-600">{address.city || "—"}</td><td className="px-5 py-3.5 text-slate-600">{address.state || "—"}</td><td className="px-5 py-3.5 text-slate-600">{address.country || "—"}</td><td className="px-5 py-3.5 font-medium text-slate-600">{address.pincode || "—"}</td><td className="relative px-3 py-3.5"><button type="button" onClick={() => setMenuId(menuId === id ? null : id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-500" aria-label={`Actions for ${address.street || "address"}`} aria-expanded={menuId === id}><MoreHorizontal className="h-4 w-4" /></button>{menuId === id && <div className="absolute right-3 top-12 z-20 w-32 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button type="button" onClick={() => { setViewing(address); setMenuId(null); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50"><MapPin className="h-3.5 w-3.5" />View</button><button type="button" onClick={() => { setEditing(address); setMenuId(null); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50"><Pencil className="h-3.5 w-3.5" />Edit</button><button type="button" onClick={() => void deleteAddress(address)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />Delete</button></div>}</td></tr>; })}</tbody></table></div><div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>Showing {activePage * pageSize + 1}–{Math.min((activePage + 1) * pageSize, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-2"><label className="sr-only" htmlFor="page-size">Rows per page</label><select id="page-size" className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600" defaultValue={String(pageSize)} disabled><option value={String(pageSize)}>{pageSize} / page</option></select><button type="button" disabled={activePage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><span className="min-w-16 text-center font-semibold text-slate-600">Page {activePage + 1} of {totalPages}</span><button type="button" disabled={activePage === totalPages - 1} onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button></div></div></section>}
    {viewing && <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">Address details</p><h2 className="mt-1 text-xl font-bold text-slate-900">{viewing.customerName || "Customer address"}</h2></div><button type="button" onClick={() => setViewing(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close address details"><X className="h-5 w-5" /></button></div><div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600"><p>{viewing.street}</p>{viewing.buildingName && <p>{viewing.buildingName}</p>}<p>{[viewing.city, viewing.state, viewing.pincode].filter(Boolean).join(", ")}</p><p>{viewing.country}</p></div></div></div>}
    {deleteTarget && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm" role="presentation"><div role="alertdialog" aria-modal="true" aria-labelledby="delete-address-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600"><Trash2 className="h-5 w-5" /></div><h2 id="delete-address-title" className="mt-4 text-lg font-bold text-slate-900">Delete this address?</h2><p className="mt-2 text-sm leading-6 text-slate-500">This will permanently remove {deleteTarget.customerName ? `${deleteTarget.customerName}'s ` : "this "}address from the directory.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-500">Cancel</button><button type="button" onClick={() => void confirmDelete()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">Delete address</button></div></div></div>}
    {form}
    {toast && <div className={`fixed bottom-5 right-5 z-60 flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl ${toast.type === "success" ? "border-emerald-200 bg-white text-emerald-800" : "border-red-200 bg-white text-red-800"}`} role="status"><span className={toast.type === "success" ? "text-emerald-500" : "text-red-500"}>{toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}</span><span>{toast.message}</span><button type="button" onClick={() => setToast(null)} className="ml-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Dismiss notification"><X className="h-4 w-4" /></button></div>}
  </main>;
}
