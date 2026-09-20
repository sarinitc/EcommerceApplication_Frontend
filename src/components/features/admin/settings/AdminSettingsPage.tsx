"use client";

import { addToast } from "@heroui/toast";
import { ArrowLeft, Bell, CalendarDays, CheckCircle2, Globe, Plus, RefreshCw, Search, Save, Store, Tag, TicketPercent } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Promotion, PromotionListResponse } from "@/types/promotion";

type AdminSettings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  enableReviews: boolean;
  autoApproveReviews: boolean;
  enableCoupons: boolean;
  showStockBadges: boolean;
  orderConfirmationEmails: boolean;
  lowStockAlerts: boolean;
  newCustomerAlerts: boolean;
  weeklySummary: boolean;
};

type StoreSettingsResponse = Partial<AdminSettings> & {
  enableProductReviews?: boolean;
  autoApproveCustomerReviews?: boolean;
  showLowStockBadges?: boolean;
  sendOrderConfirmationEmails?: boolean;
  sendLowStockAlerts?: boolean;
  sendNewCustomerAlerts?: boolean;
  sendWeeklyPerformanceSummary?: boolean;
};

const STORAGE_KEY = "indigo-admin-settings";

const defaults: AdminSettings = {
  storeName: "IndigoStore",
  supportEmail: "support@indigostore.com",
  supportPhone: "+1 (555) 010-2030",
  currency: "KHR",
  timezone: "UTC+07:00 (Phnom Penh)",
  dateFormat: "MMM d, yyyy",
  enableReviews: true,
  autoApproveReviews: false,
  enableCoupons: true,
  showStockBadges: true,
  orderConfirmationEmails: true,
  lowStockAlerts: true,
  newCustomerAlerts: false,
  weeklySummary: true,
};

function loadSettings(): AdminSettings {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<AdminSettings>) } : defaults;
  } catch {
    return defaults;
  }
}

function persistSettings(next: AdminSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function toggleClass(on: boolean) {
  return `relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-indigo-600" : "bg-gray-200"}`;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-slate-700">
      {label}
      <button type="button" onClick={() => onChange(!checked)} className={toggleClass(checked)} aria-pressed={checked}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

function TextField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <select value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function SettingCard({ icon: Icon, title, description, onSave, saving, children }: { icon: typeof Store; title: string; description: string; onSave: (event: FormEvent<HTMLFormElement>) => void; saving: boolean; children: ReactNode }) {
  return (
    <form onSubmit={onSave} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></span>
        <div>
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4">{children}</div>
      <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
          <Save className="h-4 w-4" />{saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No date" : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function promotionStatus(promotion: Promotion) {
  const now = Date.now();
  const starts = new Date(promotion.startDate).getTime();
  const ends = new Date(promotion.endDate).getTime();
  if (!promotion.active || ends < now) return { label: "Expired", className: "bg-slate-100 text-slate-500" };
  if (starts > now) return { label: "Scheduled", className: "bg-amber-50 text-amber-700" };
  if (promotion.usageLimit && (promotion.usedCount ?? 0) >= promotion.usageLimit) return { label: "Limit reached", className: "bg-rose-50 text-rose-600" };
  return { label: "Active", className: "bg-emerald-50 text-emerald-700" };
}

function promotionValue(promotion: Promotion) {
  return promotion.discountType === "PERCENTAGE" ? `${promotion.discountValue}% off` : `$${promotion.discountValue.toFixed(2)} off`;
}

export function CouponsSection({ standalone = false }: { standalone?: boolean }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: "", discountType: "PERCENTAGE", discountValue: "", minimumOrderAmount: "", startDate: "", endDate: "", usageLimit: "" });

  async function loadPromotions() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/promotions", { cache: "no-store" });
      const data = await response.json().catch(() => null) as PromotionListResponse | null;
      if (!response.ok) throw new Error(data?.message ?? "Unable to load coupons.");
      setPromotions(data?.payload ?? data?.data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load coupons.");
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function load() {
      await loadPromotions();
    }
    void load();
  }, []);

  const filteredPromotions = promotions.filter((promotion) => promotion.code.toLowerCase().includes(query.trim().toLowerCase()));
  const activeCount = promotions.filter((promotion) => promotionStatus(promotion).label === "Active").length;
  const scheduledCount = promotions.filter((promotion) => promotionStatus(promotion).label === "Scheduled").length;

  async function createPromotion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          minimumOrderAmount: form.minimumOrderAmount ? Number(form.minimumOrderAmount) : 0,
          startDate: form.startDate,
          endDate: form.endDate,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          active: true,
        }),
      });
      const data = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message ?? "The backend could not create this coupon.");
      setForm({ code: "", discountType: "PERCENTAGE", discountValue: "", minimumOrderAmount: "", startDate: "", endDate: "", usageLimit: "" });
      setShowCreateForm(false);
      await loadPromotions();
      addToast({ title: "Coupon created", description: "The coupon was saved to the promotion database.", color: "success", severity: "success", variant: "solid" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The backend could not create this coupon.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <section id={standalone ? "coupons" : undefined} className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><TicketPercent className="h-5 w-5" /></span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-500">Promotions</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Coupons</h2>
              <p className="mt-1 text-sm text-slate-500">View the discount codes currently available in your store.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="/admin/settings" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">
              <ArrowLeft className="h-4 w-4" /> Back to settings
            </a>
            <button type="button" onClick={() => setShowCreateForm((visible) => !visible)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Create coupon
            </button>
          </div>
        </div>

        {showCreateForm && (
          <form onSubmit={createPromotion} className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="sm:col-span-2"><span className="mb-1 block text-xs font-semibold text-slate-600">Coupon code *</span><input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="WELCOME10" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm uppercase outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" /></label>
              <label><span className="mb-1 block text-xs font-semibold text-slate-600">Discount type *</span><select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100"><option value="PERCENTAGE">Percentage</option><option value="FIXED_AMOUNT">Fixed amount</option></select></label>
              <label><span className="mb-1 block text-xs font-semibold text-slate-600">Discount value *</span><input required min="0.01" type="number" step="0.01" value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: event.target.value })} placeholder="10" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" /></label>
              <label><span className="mb-1 block text-xs font-semibold text-slate-600">Starts *</span><input required type="datetime-local" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" /></label>
              <label><span className="mb-1 block text-xs font-semibold text-slate-600">Ends *</span><input required type="datetime-local" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" /></label>
              <label><span className="mb-1 block text-xs font-semibold text-slate-600">Minimum order</span><input min="0" type="number" step="0.01" value={form.minimumOrderAmount} onChange={(event) => setForm({ ...form, minimumOrderAmount: event.target.value })} placeholder="0" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" /></label>
              <label><span className="mb-1 block text-xs font-semibold text-slate-600">Usage limit</span><input min="1" type="number" value={form.usageLimit} onChange={(event) => setForm({ ...form, usageLimit: event.target.value })} placeholder="Unlimited" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" /></label>
            </div>
            <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowCreateForm(false)} className="h-10 rounded-lg px-4 text-sm font-semibold text-slate-600 hover:bg-white">Cancel</button><button type="submit" disabled={creating} className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{creating ? "Saving…" : "Save coupon"}</button></div>
          </form>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 px-4 py-3"><p className="text-xs font-medium text-slate-500">Total coupons</p><p className="mt-1 text-2xl font-bold text-slate-900">{promotions.length}</p></div>
          <div className="rounded-xl bg-emerald-50/70 px-4 py-3"><p className="text-xs font-medium text-emerald-700">Active now</p><p className="mt-1 text-2xl font-bold text-emerald-800">{activeCount}</p></div>
          <div className="rounded-xl bg-amber-50/80 px-4 py-3"><p className="text-xs font-medium text-amber-700">Scheduled</p><p className="mt-1 text-2xl font-bold text-amber-800">{scheduledCount}</p></div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <label className="relative block sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search coupon code" className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-3 focus:ring-indigo-100" />
        </label>
        <button type="button" onClick={() => void loadPromotions()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 p-5 sm:p-6">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>
      ) : error ? (
        <div className="px-5 py-12 text-center sm:px-6"><p className="font-semibold text-slate-800">Could not load coupons</p><p className="mt-1 text-sm text-slate-500">{error}</p><button type="button" onClick={() => void loadPromotions()} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700">Try again</button></div>
      ) : filteredPromotions.length === 0 ? (
        <div className="px-5 py-14 text-center sm:px-6">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-500"><Tag className="h-6 w-6" /></span>
          <h3 className="mt-4 text-base font-bold text-slate-900">{promotions.length === 0 ? "No coupons yet" : "No matching coupons"}</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">{promotions.length === 0 ? "Coupons created in your promotion system will appear here automatically." : "Try a different search term to find another coupon."}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredPromotions.map((promotion) => {
            const status = promotionStatus(promotion);
            const used = promotion.usedCount ?? 0;
            const limit = promotion.usageLimit;
            return <div key={promotion.promotionId} className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Tag className="h-4 w-4" /></span>
                <div className="min-w-0"><p className="truncate font-bold tracking-wide text-slate-800">{promotion.code}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{formatDate(promotion.startDate)} – {formatDate(promotion.endDate)}</p></div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm sm:justify-end"><span className="font-bold text-indigo-600">{promotionValue(promotion)}</span><span className="text-slate-500">{limit ? `${used}/${limit} used` : `${used} used`}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></div>
            </div>;
          })}
        </div>
      )}
    </section>
  );
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function loadRemoteSettings() {
      try {
        const response = await fetch("/api/admin/settings", { cache: "no-store" });
        const data = await response.json() as { payload?: StoreSettingsResponse; message?: string };
        if (!response.ok || !data.payload) throw new Error(data.message ?? "Unable to load store settings.");
        const remoteSettings: AdminSettings = {
          storeName: data.payload.storeName ?? defaults.storeName,
          supportEmail: data.payload.supportEmail ?? defaults.supportEmail,
          supportPhone: data.payload.supportPhone ?? defaults.supportPhone,
          currency: data.payload.currency ?? defaults.currency,
          timezone: data.payload.timezone ?? defaults.timezone,
          dateFormat: data.payload.dateFormat ?? defaults.dateFormat,
          enableCoupons: data.payload.enableCoupons ?? defaults.enableCoupons,
          enableReviews: data.payload.enableProductReviews ?? defaults.enableReviews,
          autoApproveReviews: data.payload.autoApproveCustomerReviews ?? defaults.autoApproveReviews,
          showStockBadges: data.payload.showLowStockBadges ?? defaults.showStockBadges,
          weeklySummary: data.payload.sendWeeklyPerformanceSummary ?? defaults.weeklySummary,
          orderConfirmationEmails: data.payload.sendOrderConfirmationEmails ?? defaults.orderConfirmationEmails,
          lowStockAlerts: data.payload.sendLowStockAlerts ?? defaults.lowStockAlerts,
          newCustomerAlerts: data.payload.sendNewCustomerAlerts ?? defaults.newCustomerAlerts,
        };
        setSettings(remoteSettings);
        persistSettings(remoteSettings);
      } catch {
        setSettings(loadSettings());
      } finally {
        setLoading(false);
      }
    }

    void loadRemoteSettings();
  }, []);

  function update<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    persistSettings(nextSettings);
  }

  function persist(title: string, section: string) {
    return async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSaving(section);
      const requests: Record<string, { endpoint: string; body: Record<string, string | boolean> }> = {
        general: {
          endpoint: "/api/admin/settings/general",
          body: { storeName: settings.storeName, supportEmail: settings.supportEmail, supportPhone: settings.supportPhone },
        },
        locale: {
          endpoint: "/api/admin/settings/locale",
          body: { currency: settings.currency, dateFormat: settings.dateFormat, timezone: settings.timezone },
        },
        storefront: {
          endpoint: "/api/admin/settings/storefront",
          body: { enableProductReviews: settings.enableReviews, autoApproveCustomerReviews: settings.autoApproveReviews, enableCoupons: settings.enableCoupons, showLowStockBadges: settings.showStockBadges },
        },
        notification: {
          endpoint: "/api/admin/settings/notifications",
          body: { sendOrderConfirmationEmails: settings.orderConfirmationEmails, sendLowStockAlerts: settings.lowStockAlerts, sendNewCustomerAlerts: settings.newCustomerAlerts, sendWeeklyPerformanceSummary: settings.weeklySummary },
        },
      };
      const request = requests[section];
      try {
        const response = await fetch(request.endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request.body),
        });
        if (!response.ok) throw new Error(`The backend rejected the ${section} settings.`);
      } catch {
        setSaving(null);
        addToast({ title: `Unable to save ${title.toLowerCase()}`, description: "The backend could not save your changes.", color: "danger", severity: "danger", variant: "solid" });
        return;
      }
      persistSettings(settings);
      setSaving(null);
      addToast({ title: `${title} saved`, description: "Your changes were saved to the backend.", icon: <CheckCircle2 className="h-5 w-5" />, color: "success", severity: "success", variant: "solid", timeout: 4000, shouldShowTimeoutProgress: true });
    };
  }

  return (
    <main id="settings" className="min-h-screen space-y-6 bg-[#f8f9fc] p-5 sm:p-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500">Store configuration</p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1.5 text-sm text-slate-500">Manage your store preferences, locale and notifications.</p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <SettingCard icon={Store} title="General" description="Basic information about your store." saving={saving === "general"} onSave={persist("General settings", "general")}>
          <TextField label="Store name" value={settings.storeName} onChange={(value) => update("storeName", value)} placeholder="e.g. IndigoStore" />
          <TextField label="Support email" type="email" value={settings.supportEmail} onChange={(value) => update("supportEmail", value)} placeholder="support@store.com" />
          <TextField label="Support phone" value={settings.supportPhone} onChange={(value) => update("supportPhone", value)} placeholder="+1 (555) 000-0000" />
        </SettingCard>

        <SettingCard icon={Globe} title="Currency & locale" description="How money, dates and time display across the store." saving={saving === "locale"} onSave={persist("Locale preferences", "locale")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField label="Currency" value={settings.currency} onChange={(value) => update("currency", value)} options={["KHR", "USD"]} />
            <SelectField label="Date format" value={settings.dateFormat} onChange={(value) => update("dateFormat", value)} options={["MMM d, yyyy", "dd/MM/yyyy", "yyyy-MM-dd", "MM/dd/yyyy"]} />
          </div>
          <SelectField label="Timezone" value={settings.timezone} onChange={(value) => update("timezone", value)} options={["UTC+07:00 (Phnom Penh)"]} />
        </SettingCard>

        <SettingCard icon={Store} title="Storefront" description="Storefront features shown to your customers." saving={saving === "storefront"} onSave={persist("Storefront preferences", "storefront")}>
          <Toggle label="Enable product reviews" checked={settings.enableReviews} onChange={(value) => update("enableReviews", value)} />
          {settings.enableReviews && <Toggle label="Auto-approve customer reviews" checked={settings.autoApproveReviews} onChange={(value) => update("autoApproveReviews", value)} />}
          <Toggle label="Enable coupons" checked={settings.enableCoupons} onChange={(value) => update("enableCoupons", value)} />
          <Toggle label="Show low-stock badges on the storefront" checked={settings.showStockBadges} onChange={(value) => update("showStockBadges", value)} />
        </SettingCard>

        <SettingCard icon={Bell} title="Notifications" description={loading ? "Loading your notification preferences…" : "Choose which emails you and your customers receive."} saving={saving === "notification"} onSave={persist("Notification preferences", "notification")}>
          <Toggle label="Send order confirmation emails" checked={settings.orderConfirmationEmails} onChange={(value) => update("orderConfirmationEmails", value)} />
          <Toggle label="Send low-stock alerts" checked={settings.lowStockAlerts} onChange={(value) => update("lowStockAlerts", value)} />
          <Toggle label="Send new-customer alerts" checked={settings.newCustomerAlerts} onChange={(value) => update("newCustomerAlerts", value)} />
          <Toggle label="Send a weekly performance summary" checked={settings.weeklySummary} onChange={(value) => update("weeklySummary", value)} />
        </SettingCard>
      </div>
    </main>
  );
}