"use client";

import { useSession } from "next-auth/react";
import type { ReactNode } from "react";

type UserAvatarProps = {
  fallback: ReactNode;
  className: string;
};

/** Uses the shared session, so it rerenders as soon as a profile photo is uploaded. */
export function UserAvatar({ fallback, className }: UserAvatarProps) {
  const { data: session } = useSession();
  const image = session?.user?.image;
  const name = session?.user?.name ?? "Profile";

  return typeof image === "string" && image.trim() ? (
    <img src={image} alt={`${name}'s profile photo`} className={className} />
  ) : fallback;
}
