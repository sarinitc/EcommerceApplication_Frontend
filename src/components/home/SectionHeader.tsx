import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  action?: ReactNode;
};

export function SectionHeader({ eyebrow, title, subtitle, align = "center", action }: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div className={centered ? "flex flex-col items-center text-center" : "flex flex-col items-start"}>
      {eyebrow && (
        <p className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-light px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
          {eyebrow}
        </p>
      )}
      <h2 className={`mt-4 font-display text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08] ${centered ? "" : ""}`}>{title}</h2>
      {subtitle && (
        <p className={`mt-3 max-w-xl text-[15px] leading-6 text-slate-500 sm:text-base ${centered ? "mx-auto" : ""}`}>{subtitle}</p>
      )}
      {action && <div className={centered ? "mt-6" : "mt-6"}>{action}</div>}
    </div>
  );
}