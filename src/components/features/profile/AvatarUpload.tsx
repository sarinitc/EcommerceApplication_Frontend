"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { addToast } from "@heroui/toast";
import { Camera, LoaderCircle } from "lucide-react";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type AvatarUploadProps = {
  currentAvatarUrl?: string | null;
  userName: string;
  onUploadSuccess: (newUrl: string | null) => void | Promise<void>;
};

function getInitial(userName: string) {
  return userName.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase() || "U";
}

function getAvatarUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const nested = record.payload ?? record.data;
  const nestedRecord = nested && typeof nested === "object" ? nested as Record<string, unknown> : null;
  const candidates = [record.avatarUrl, record.imageUrl, record.profileImage, record.profileImageUrl, record.url, record.image, nestedRecord?.avatarUrl, nestedRecord?.imageUrl, nestedRecord?.profileImage, nestedRecord?.profileImageUrl, nestedRecord?.url, nestedRecord?.image];
  return candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim() ?? null;
}

export function AvatarUpload({ currentAvatarUrl, userName, onUploadSuccess }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const displayUrl = previewUrl ?? currentAvatarUrl ?? null;

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const showError = (description: string) => {
    setError(description);
    addToast({ title: "Photo upload failed", description, color: "danger" });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isUploading) return;
    if (!ACCEPTED_TYPES.has(file.type)) return showError("Choose a JPG, PNG, or WebP image.");
    if (!file.size) return showError("This file is empty. Choose another image.");
    if (file.size > MAX_FILE_SIZE) return showError("Choose an image smaller than 5 MB.");

    const previewUrl = URL.createObjectURL(file);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = previewUrl;
    setFailedUrl(null);
    setError("");
    setPreviewUrl(previewUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = payload && typeof payload === "object" && "message" in payload ? payload.message : null;
        throw new Error(typeof message === "string" && message.trim() ? message : "Failed to upload photo. Try again.");
      }
      const avatarUrl = getAvatarUrl(payload);
      if (!avatarUrl) throw new Error("The server did not return the new photo URL.");

      setFailedUrl(null);
      try {
        await onUploadSuccess(avatarUrl);
      } catch {
        const message = "Your photo was saved, but the account display could not refresh. Please reload the page.";
        setError(message);
        addToast({ title: "Profile photo saved", description: message, color: "warning" });
        return;
      }
      addToast({ title: "Profile photo updated", color: "success" });
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to upload photo. Try again.");
    } finally {
      URL.revokeObjectURL(previewUrl);
      previewUrlRef.current = null;
      setPreviewUrl(null);
      setIsUploading(false);
    }
  };

  const isBusy = isUploading;
  const hasImage = Boolean(displayUrl && displayUrl !== failedUrl);
  return (
    <div className="shrink-0">
      <button type="button" onClick={() => inputRef.current?.click()} disabled={isBusy} className="relative grid h-24 w-24 shrink-0 cursor-pointer place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-3xl font-bold text-white shadow-lg ring-4 ring-white transition-all duration-150 hover:ring-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500 disabled:cursor-wait xl:h-28 xl:w-28" aria-label="Change profile photo" aria-busy={isBusy} title="Upload a JPG, PNG, or WebP photo (up to 5 MB)">
        {/* Local file previews use blob URLs and do not need image optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {hasImage ? <img key={displayUrl} src={displayUrl!} alt="" onError={() => setFailedUrl(displayUrl)} className="absolute inset-0 h-full w-full rounded-full object-cover" /> : <span aria-hidden="true">{getInitial(userName)}</span>}
        {isBusy ? <span className="absolute inset-0 grid place-items-center rounded-full bg-black/40" aria-label="Uploading profile photo"><LoaderCircle size={22} className="animate-spin" /></span> : <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-white ring-2 ring-white shadow-md transition-all duration-150 hover:scale-110 hover:shadow-lg" aria-hidden="true"><Camera size={16} /></span>}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label="Upload profile photo" disabled={isBusy} onChange={handleFileChange} />
      {error && <p role="alert" className="mt-3 max-w-56 text-xs text-red-600">{error}</p>}
    </div>
  );
}
