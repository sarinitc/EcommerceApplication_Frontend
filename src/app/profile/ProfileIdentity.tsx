"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { addToast } from "@heroui/toast";
import { AvatarUpload } from "./AvatarUpload";

type ProfileIdentityProps = { name: string; email: string; role: string | null; image?: string | null };

export function ProfileIdentity({ name, email, role, image }: ProfileIdentityProps) {
  const { update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [avatarUrl, setAvatarUrl] = useState(image ?? null);

  useEffect(() => {
    if (searchParams.get("chooseProfilePicture") !== "1" || avatarUrl) return;
    addToast({ title: "Choose profile picture", description: "Click your avatar to upload a JPG, PNG, or WebP image.", color: "primary" });
    router.replace("/profile");
  }, [avatarUrl, router, searchParams]);

  const handleUploadSuccess = async (newUrl: string | null) => {
    setAvatarUrl(newUrl);
    await update({ user: { image: newUrl } });
  };

  return <section className="profile-identity" id="profile-summary" aria-label="Profile summary">
    <AvatarUpload currentAvatarUrl={avatarUrl} userName={name} onUploadSuccess={handleUploadSuccess} />
    <div><h2>{name}</h2>{email && <p>{email}</p>}{role && <span className="profile-role">{role}</span>}</div>
  </section>;
}
