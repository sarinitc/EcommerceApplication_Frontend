"use client";

import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  return <div className="flex min-w-[1180px] bg-[#f8f9fb]"><Sidebar /><div className="min-h-screen flex-1"><Header />{children}</div></div>;
}
