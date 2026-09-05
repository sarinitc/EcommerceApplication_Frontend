import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CustomersList } from "./CustomersList";
import { AdminShell } from "../AdminShell";

export default async function CustomersPage() { const session = await auth(); if (!session?.user) redirect("/login"); if (!(session.user as { roles?: string[] }).roles?.includes("ADMIN")) redirect("/"); return <AdminShell><CustomersList /></AdminShell>; }
