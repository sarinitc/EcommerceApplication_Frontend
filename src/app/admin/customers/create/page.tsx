import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/features/admin/AdminShell";
import { CustomerForm } from "@/components/features/admin/customers/CustomerForm";
export default async function CreateCustomerPage() { const session = await auth(); if (!session?.user) redirect('/login'); if (!(session.user as { roles?: string[] }).roles?.includes('ADMIN')) redirect('/'); return <AdminShell><CustomerForm mode="create" /></AdminShell>; }
