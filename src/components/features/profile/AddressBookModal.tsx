"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Home, Loader2, MapPin, Plus, Trash2, X } from "lucide-react";
import { inputClass, primaryButton, secondaryButton } from "./Modal";

type Address = {
  addressId?: number | string;
  street?: string;
  buildingName?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
};

const DEMO_ADDRESSES: Address[] = [
  { addressId: "demo-1", street: "123 Market Lane, Apt 4B", city: "San Francisco", state: "CA", country: "United States", pincode: "94105" },
  { addressId: "demo-2", street: "456 Commerce Blvd, Suite 100", buildingName: "Downtown Tower", city: "San Francisco", state: "CA", country: "United States", pincode: "94107" },
];

function addressLines(a: Address): string[] {
  const cityState = [a.city, a.state].filter(Boolean).join(", ");
  const cityStatePin = a.pincode ? `${cityState} ${a.pincode}` : cityState;
  return [a.street, a.buildingName, cityStatePin, a.country].filter(Boolean) as string[];
}

export function AddressBookModal({ onClose, notify }: { onClose: () => void; notify?: (text: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [view, setView] = useState<"list" | "add">("list");
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | string | null>(null);

  useEffect(() => {
    const el = dialog.current;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    el?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      el?.close();
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/addresses", { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `Address API returned HTTP ${res.status}.`);
        const list = Array.isArray(data?.payload) ? data.payload : Array.isArray(data) ? data : [];
        setAddresses(list);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setDemoMode(true);
          setAddresses(DEMO_ADDRESSES);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setAddError(null);
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const body = {
      street: String(fd.get("street")),
      buildingName: String(fd.get("buildingName") || "") || undefined,
      city: String(fd.get("city")),
      state: String(fd.get("state") || "") || undefined,
      country: String(fd.get("country")),
      pincode: String(fd.get("pincode")),
    };
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result?.message || `Address API returned HTTP ${res.status}.`);
      setAddresses((prev) => [...prev, result?.payload ?? { ...body, addressId: Date.now() }]);
      setView("list");
      setSaving(false);
      notify?.("Address saved successfully");
    } catch (err) {
      if (demoMode) {
        setAddresses((prev) => [...prev, { ...body, addressId: Date.now() }]);
        setView("list");
        notify?.("Address added (demo mode)");
      } else {
        setAddError(err instanceof Error ? err.message : "Unable to save address.");
        setSaving(false);
      }
    }
  }

  async function handleDelete() {
    if (deleteTarget === null) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    if (demoMode) {
      setAddresses((prev) => prev.filter((a) => a.addressId !== id));
      notify?.("Address removed");
      return;
    }
    try {
      const response = await fetch(`/api/addresses/${encodeURIComponent(String(id))}`, { method: "DELETE" });
      const body = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(body?.message || `Unable to remove address (HTTP ${response.status}).`);
    } catch (err) {
      notify?.(err instanceof Error && err.message ? err.message : "Unable to remove address.");
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.addressId !== id));
    notify?.("Address removed");
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="address-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const b = e.currentTarget.getBoundingClientRect();
          if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) onClose();
        }
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border-0 bg-white text-gray-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#ebedf8] bg-white px-6 py-5">
        <div>
          <h2 id="address-dialog-title" className="text-xl font-bold text-[#11143d]">My Addresses</h2>
          <p className="mt-1 text-sm text-[#69739e]">Manage delivery addresses for your orders.</p>
        </div>
        <button type="button" onClick={onClose} className="shrink-0 cursor-pointer rounded-lg p-2 text-gray-400 transition-all duration-150 hover:bg-gray-100 hover:text-gray-600" aria-label="Close address book">
          <X size={20} />
        </button>
      </div>

      <div className="px-6 py-5">
        {view === "list" && !loading && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#69739e]">
              Saved addresses
              {demoMode && <span className="ml-1 text-[10px] text-gray-400">(demo)</span>}
              {addresses.length > 0 && <span className="ml-1.5 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-[#6366f1]">{addresses.length}</span>}
            </p>
            <button type="button" onClick={() => { setView("add"); setAddError(null); setSaving(false); }} className={primaryButton}>
              <Plus size={16} className="mr-1 inline-block" /> Add New Address
            </button>
          </div>
        )}

        {view === "list" && loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#6366f1]" />
          </div>
        )}

        {view === "list" && !loading && addresses.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-indigo-50 text-[#6366f1]">
              <MapPin size={28} strokeWidth={1.8} />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-[#11143d]">No addresses yet</h3>
            <p className="mt-1.5 max-w-xs text-sm text-[#69739e]">Add a delivery address to use at checkout and manage your orders.</p>
            <button type="button" onClick={() => { setView("add"); setAddError(null); setSaving(false); }} className={`${primaryButton} mt-5`}>
              <Plus size={16} className="mr-1 inline-block" /> Add Your First Address
            </button>
          </div>
        )}

        {view === "list" && !loading && addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((addr, index) => {
              const lines = addressLines(addr);
              const id = addr.addressId ?? index;
              const isDeleting = deleteTarget === id;
              return (
                <div key={String(id)} className="group relative rounded-xl border border-[#e5e8f4] bg-[#fafaff] p-4 transition-all duration-150 hover:border-indigo-200 hover:shadow-[0_2px_8px_#6366f110]">
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-[#6366f1]">
                      {index === 0 ? <Home size={20} strokeWidth={1.8} /> : <MapPin size={20} strokeWidth={1.8} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[#191d46]">{index === 0 ? "Home" : `Address ${index + 1}`}</span>
                        {index === 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Default</span>}
                      </div>
                      <div className="mt-1.5 space-y-0.5 text-sm leading-5 text-[#5c6491]">
                        {lines.map((line) => <p key={line}>{line}</p>)}
                      </div>
                    </div>
                    {isDeleting ? (
                      <div className="flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium">
                        <span className="text-red-600">Remove?</span>
                        <button type="button" onClick={() => handleDelete()} className="cursor-pointer rounded-md bg-red-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-red-700">Yes</button>
                        <button type="button" onClick={() => setDeleteTarget(null)} className="cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold text-gray-500 transition hover:bg-gray-100">No</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setDeleteTarget(id)} className="shrink-0 cursor-pointer rounded-lg p-2 text-gray-300 opacity-0 transition-all duration-150 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100" aria-label="Remove address">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "add" && (
          <form onSubmit={handleAdd}>
            <div className="mb-5 flex items-center gap-3">
              <button type="button" onClick={() => setView("list")} className="cursor-pointer rounded-lg p-2 text-gray-500 transition-all duration-150 hover:bg-gray-100" aria-label="Back to address list">
                ←
              </button>
              <h3 className="text-lg font-bold text-[#11143d]">Add new address</h3>
            </div>
            {addError && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{addError}</p>}
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Street address <span className="text-red-500">*</span>
                <input required name="street" className={inputClass} placeholder="House No, Street Name" />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Building / landmark <span className="font-normal text-gray-400">(optional)</span>
                <input name="buildingName" className={inputClass} placeholder="Near City Mall" />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
                <input required name="city" className={inputClass} placeholder="Phnom Penh" />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                State / province <span className="font-normal text-gray-400">(optional)</span>
                <input name="state" className={inputClass} placeholder="Phnom Penh" />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Country <span className="text-red-500">*</span>
                <input required name="country" className={inputClass} placeholder="Cambodia" defaultValue="Cambodia" />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Postal code <span className="text-red-500">*</span>
                <input required name="pincode" className={inputClass} placeholder="12000" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setView("list")} className={secondaryButton}>Cancel</button>
              <button type="submit" disabled={saving} className={`${primaryButton} ${saving ? "opacity-60" : ""}`}>
                {saving ? "Saving…" : "Save Address"}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
