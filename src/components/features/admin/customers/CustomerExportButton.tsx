"use client";

import { useState } from "react";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import { addToast } from "@heroui/toast";

export function CustomerExportButton({ search, status }: { search: string; status: string }) {
  const [exporting, setExporting] = useState(false);

  const exportCustomers = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (status !== "all") query.set("status", status === "Inactive" ? "INVITED" : status.toUpperCase());

      const response = await fetch(`/api/admin/customers/export?${query}`, { cache: "no-store" });
      if (!response.ok) {
        const error = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(error?.message || `Unable to export customers (HTTP ${response.status}).`);
      }

      const file = await response.blob();
      if (!file.size) throw new Error("The customer export file is empty. Please try again.");

      const disposition = response.headers.get("content-disposition") ?? "";
      const encodedFilename = disposition.match(/filename\*=UTF-8'[^']*'([^;]+)/i)?.[1];
      const filenameMatch = disposition.match(/filename="([^"]+)"|filename=([^;]+)/i);
      let filename = (filenameMatch?.[1] ?? filenameMatch?.[2])?.trim() || "customers.csv";
      if (encodedFilename) {
        try {
          filename = decodeURIComponent(encodedFilename.trim());
        } catch {
          // Keep the plain filename if the encoded header is malformed.
        }
      }

      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      try {
        link.click();
      } finally {
        link.remove();
        // Give the browser time to start reading the file before releasing it.
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      addToast({
        title: "Customers exported successfully",
        description: `Your CSV download has started: ${filename}`,
        icon: <CheckCircle2 className="h-5 w-5" />,
        color: "success",
        severity: "success",
        variant: "solid",
        timeout: 4000,
        shouldShowTimeoutProgress: true,
      });
    } catch (cause) {
      addToast({
        title: "Export failed",
        description: cause instanceof Error ? cause.message : "Unable to export customers. Please try again.",
        color: "danger",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void exportCustomers()}
      disabled={exporting}
      aria-busy={exporting}
      title="Download customer CSV using the search and status filters"
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
    >
      {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {exporting ? "Exporting…" : "Export"}
    </button>
  );
}
