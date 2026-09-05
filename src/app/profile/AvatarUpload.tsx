"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { addToast } from "@heroui/toast";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import CircularProgress from "@mui/material/CircularProgress";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type AvatarUploadProps = {
  currentAvatarUrl?: string | null;
  userName: string;
  onUploadSuccess: (newUrl: string | null) => void | Promise<void>;
};

function getInitial(userName: string) {
  return userName.trim().charAt(0).toUpperCase() || "U";
}

function getAvatarUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const nested = record.payload ?? record.data;
  const nestedRecord = nested && typeof nested === "object" ? nested as Record<string, unknown> : null;
  const candidates = [record.avatarUrl, record.imageUrl, record.profileImage, record.profileImageUrl, record.url, record.image, nestedRecord?.avatarUrl, nestedRecord?.imageUrl, nestedRecord?.profileImage, nestedRecord?.profileImageUrl, nestedRecord?.url, nestedRecord?.image];
  return candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? null;
}

export function AvatarUpload({ currentAvatarUrl, userName, onUploadSuccess }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(currentAvatarUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!previewUrlRef.current) setDisplayUrl(currentAvatarUrl ?? null);
  }, [currentAvatarUrl]);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  const showError = (description: string) => addToast({ title: "Photo upload failed", description, color: "danger" });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.has(file.type)) return showError("Choose a JPG, PNG, or WebP image.");
    if (file.size > MAX_FILE_SIZE) return showError("Choose an image smaller than 5 MB.");

    const previousUrl = currentAvatarUrl ?? null;
    const previewUrl = URL.createObjectURL(file);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = previewUrl;
    setDisplayUrl(previewUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const payload: unknown = await response.json().catch(() => null);
      const avatarUrl = getAvatarUrl(payload);
      if (!response.ok || !avatarUrl) throw new Error("The server did not return the new photo URL.");

      URL.revokeObjectURL(previewUrl);
      previewUrlRef.current = null;
      setDisplayUrl(avatarUrl);
      await onUploadSuccess(avatarUrl);
      addToast({ title: "Profile photo updated", color: "success" });
    } catch {
      URL.revokeObjectURL(previewUrl);
      previewUrlRef.current = null;
      setDisplayUrl(previousUrl);
      showError("Failed to upload photo. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const isBusy = isUploading;
  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <button type="button" onClick={() => inputRef.current?.click()} disabled={isBusy} className="group relative grid h-[58px] w-[58px] place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#6158e9] to-[#3730a3] text-[22px] font-extrabold text-white shadow-[0_8px_16px_rgba(79,70,229,.22)] outline-none transition focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-3 disabled:cursor-wait" aria-label="Change profile photo">
        {displayUrl ? <img src={displayUrl} alt={`${userName}'s profile photo`} className="h-full w-full object-cover" /> : getInitial(userName)}
        <span className="absolute inset-0 grid place-items-center bg-slate-950/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true"><PhotoCameraOutlinedIcon fontSize="small" /></span>
        {isBusy && <span className="absolute inset-0 grid place-items-center bg-slate-950/50" aria-label="Uploading profile photo"><CircularProgress size={22} sx={{ color: "white" }} /></span>}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFileChange} />
      {!displayUrl && <span className="whitespace-nowrap text-xs font-semibold text-[#4f46e5]">Choose profile picture</span>}
    </div>
  );
}
