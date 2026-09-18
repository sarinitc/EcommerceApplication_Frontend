"use client";

import { addToast } from "@heroui/toast";
import { Bell, CheckCircle2, Globe, Save, Store } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

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
    <main className="min-h-screen space-y-6 bg-[#f8f9fc] p-5 sm:p-6">
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