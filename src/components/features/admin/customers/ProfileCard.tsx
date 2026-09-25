"use client";
import { Camera, UserRound } from "lucide-react";
import { useRef } from "react";
import { resolveProfileImageUrl } from "@/lib/image-urls";
import { inputClass, type FormData } from "./form-types";

export function ProfileCard({ data, errors, mode, imagePreview, onImageSelected, onChange }: {
  data: FormData;
  errors: Record<string, string>;
  mode: "create" | "edit";
  imagePreview: string;
  onImageSelected: (file: File) => void;
  onChange: (key: keyof FormData, value: FormData[keyof FormData]) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const fields = [["firstName", "First Name"], ["lastName", "Last Name"], ["email", "Email"], ["phone", "Phone Number"]] as const;
  return <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
    <h2 className="text-base font-bold text-slate-800">Profile information</h2>
    <div className="mt-5 flex items-center gap-5">
      <button type="button" onClick={() => fileInput.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const image = e.dataTransfer.files[0]; if (image) onImageSelected(image); }} className="group relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-indigo-50 text-indigo-500">
        <input ref={fileInput} onChange={(e) => { const image = e.target.files?.[0]; if (image) onImageSelected(image); e.target.value = ""; }} accept="image/jpeg,image/png,image/webp" type="file" className="hidden" />
        {imagePreview || data.avatar ? <img src={imagePreview || resolveProfileImageUrl(data.avatar, process.env.NEXT_PUBLIC_API_URL ?? "")} alt="Profile preview" className="h-full w-full object-cover" /> : <UserRound className="h-8 w-8" />}
        <span className="absolute inset-0 grid place-items-center bg-slate-950/45 opacity-0 transition group-hover:opacity-100"><Camera className="h-5 w-5 text-white" /></span>
      </button>
      <p className="text-sm text-slate-500">Click or drag a JPEG, PNG, or WebP image (up to 5 MB).</p>
    </div>
    {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
    <div className="mt-6 grid grid-cols-2 gap-4">{fields.map(([key,label]) => { const locked = mode === "edit" && (key === "email" || key === "phone"); return <label key={key} className="block"><span className="mb-1 block text-sm font-medium text-gray-700">{label}{key !== "phone" && " *"}</span><input value={data[key] as string} disabled={locked} type={key === "email" ? "email" : "text"} onChange={(e) => onChange(key,e.target.value)} className={`${inputClass} ${errors[key] ? "border-red-500" : ""} ${locked ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`} />{locked ? <span className="mt-1 block text-xs text-slate-400">{label} cannot be changed after creation.</span> : errors[key] && <span className="mt-1 block text-xs text-red-600">{errors[key]}</span>}</label>; })}</div>
  </section>;
}
