"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";
import { AddressesCard } from "./AddressesCard";
import { AccountSettingsCard } from "./AccountSettingsCard";
import { ContactInfoCard } from "./ContactInfoCard";
import { CustomerOrdersCard } from "./CustomerOrdersCard";
import { NotesCard } from "./NotesCard";
import { ProfileCard } from "./ProfileCard";
import { StatusCard } from "./StatusCard";
import { CustomerSaveError, saveCustomer } from "./save-customer";
import type { Customer } from "./customer-data";
import type { FormData } from "./form-types";

const empty: FormData = { avatar: "", firstName: "", lastName: "", email: "", phone: "", gender: "", dateOfBirth: "", language: "English", currency: "USD", addresses: [], status: "Active", customerType: "New", taxExempt: false, sendInvite: true, emailVerified: false, marketing: true, password: "", notes: "", tags: [] };
const fromCustomer = (c: Customer): FormData => {
  const [firstName, ...rest] = c.name.split(" ");
  return { ...empty, avatar: c.avatar, firstName, lastName: rest.join(" "), email: c.email, phone: c.phone, status: c.status, customerType: c.orderCount > 6 ? "VIP" : c.orderCount > 1 ? "Regular" : "New", addresses: c.addresses.map((a, i) => ({ label: a.label === "Shipping" ? "Home" : "Work", street: a.value.split(",")[0], city: c.location, state: "", zip: "", country: c.country, defaultShipping: i === 0, defaultBilling: i === 1 })) };
};

export function CustomerForm({ mode, customer }: { mode: "create" | "edit"; customer?: Customer }) {
  const [data, setData] = useState<FormData>(customer ? fromCustomer(customer) : empty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const previewUrl = useRef("");
  useEffect(() => () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [creationNeedsLookup, setCreationNeedsLookup] = useState(false);
  const createdId = useRef<number | undefined>(undefined);
  const router = useRouter();
  const update = (key: keyof FormData, value: FormData[keyof FormData]) => setData(c => ({ ...c, [key]: value }));
  const chooseImage = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors(c => ({ ...c, image: "Use a JPEG, PNG, or WebP image." }));
    } else if (!file.size || file.size > 5 * 1024 * 1024) {
      setErrors(c => ({ ...c, image: "Image must be 5 MB or smaller." }));
    } else {
      setErrors(c => { const next = { ...c }; delete next.image; return next; });
      const url = URL.createObjectURL(file);
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = url;
      setImagePreview(url);
      setImageFile(file);
    }
  };
  const save = async () => {
    if (creationNeedsLookup) return;
    const next: Record<string, string> = {};
    if (!data.firstName.trim()) next.firstName = "First name is required.";
    if (!data.lastName.trim()) next.lastName = "Last name is required.";
    if (!/^\S+@\S+\.\S+$/.test(data.email)) next.email = "Enter a valid email address.";
    if (mode === "create" && data.password.length < 8) next.password = "A temporary password must contain at least 8 characters.";
    if (errors.image) next.image = errors.image;
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      const editPayload = {
        firstName: data.firstName.trim(), lastName: data.lastName.trim(), phoneNumber: data.phone.trim() || null,
        profileImage: data.avatar || null, accountStatus: data.status === "Inactive" ? "INVITED" : data.status.toUpperCase(),
        customerType: data.customerType === "Regular" ? "RETURNING" : data.customerType.toUpperCase(),
        taxExempt: data.taxExempt, verified: data.emailVerified,
        gender: data.gender ? data.gender.toUpperCase().replaceAll(" ", "_") : null,
        preferredLanguage: data.language, preferredCurrency: data.currency, dateOfBirth: data.dateOfBirth || null,
        allowMarketingEmails: data.marketing, internalNotes: data.notes,
      };
      const createPayload = {
        username: `${data.firstName.trim()} ${data.lastName.trim()}`, email: data.email.trim(),
        phoneNumber: data.phone.trim() || null, profileImage: null, temporaryPassword: data.password,
        verified: data.emailVerified, accountStatus: data.status.toUpperCase(),
        addresses: data.addresses.filter(a => a.street && a.city && a.country && a.zip).map(a => ({ street: a.street, buildingName: "", city: a.city, state: a.state, country: a.country, pincode: a.zip })),
      };
      await saveCustomer({
        mode, customerId: mode === "edit" ? customer?.id : createdId.current,
        createPayload, editPayload, imageFile,
        onCustomerCreated: id => { createdId.current = id; },
      });
      addToast({ title: mode === "edit" ? "Customer updated" : "Customer created", color: "success" });
      router.push("/admin/customers");
      router.refresh();
    } catch (cause) {
      if (cause instanceof CustomerSaveError && cause.customerId && mode === "create") createdId.current = cause.customerId;
      if (cause instanceof CustomerSaveError && cause.stage === "unknown-id") setCreationNeedsLookup(true);
      addToast({
        title: cause instanceof CustomerSaveError && cause.stage === "image" ? "Customer image upload failed" : cause instanceof CustomerSaveError && cause.stage === "unknown-id" ? "Customer created; image not uploaded" : `${mode === "edit" ? "Update" : "Create"} customer failed`,
        description: cause instanceof Error ? cause.message : "Unable to save customer.", color: "danger",
      });
    } finally { setSaving(false); }
  };
  const action = creationNeedsLookup ? "Open customer list to continue" : mode === "edit" ? saving ? "Updating…" : "Update Customer" : saving ? "Saving…" : "Save Customer";
  const cancel = <Link href="/admin/customers" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</Link>;
  const saveButton = <button disabled={saving || creationNeedsLookup} onClick={save} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{action}</button>;
  return <div className="p-6">
    <div className="mb-6 flex items-start justify-between"><div><nav className="mb-2 text-sm text-slate-400"><Link href="/admin" className="hover:text-indigo-600">Dashboard</Link> / <Link href="/admin/customers" className="hover:text-indigo-600">Customers</Link> / {mode === "edit" ? "Edit" : "Create"}</nav><h1 className="text-2xl font-bold tracking-tight text-slate-800">{mode === "edit" ? "Edit Customer" : "Add Customer"}</h1></div><div className="flex gap-3">{cancel}{saveButton}</div></div>
    <div className="grid grid-cols-3 gap-6"><div className="col-span-2 space-y-6"><ProfileCard data={data} errors={errors} mode={mode} imagePreview={imagePreview} onImageSelected={chooseImage} onChange={update} /><ContactInfoCard data={data} onChange={update} /><AddressesCard data={data} onChange={update} />{mode === "edit" && customer && <CustomerOrdersCard customer={customer} />}</div><div className="space-y-6"><StatusCard data={data} onChange={update} /><AccountSettingsCard data={data} mode={mode} onChange={update} /><NotesCard data={data} onChange={update} />{errors.password && <p className="text-sm text-red-600">{errors.password}</p>}</div></div>
    <div className="sticky bottom-0 z-10 mt-6 flex justify-end gap-3 border-t border-slate-200 bg-white p-4">{cancel}{saveButton}</div>
  </div>;
}
