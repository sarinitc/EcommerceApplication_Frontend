import { Check, Circle } from "lucide-react";
import { formatTime, type OrderTimelineStep } from "./orders-data";

export function OrderTimeline({ steps }: { steps: OrderTimelineStep[] }) {
  return (
    <ol className="relative space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const Icon = step.state === "done" ? Check : Circle;
        const iconColor = step.state === "done" ? "bg-emerald-500 text-white border-emerald-500"
          : step.state === "current" ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-slate-300 border-slate-200";
        const labelColor = step.state === "upcoming" ? "text-slate-400" : "text-slate-700";
        return (
          <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && <span className="absolute left-[11px] top-6 h-full w-px bg-slate-200" aria-hidden="true" />}
            <span className={`relative z-10 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border ${iconColor}`} aria-hidden="true">
              <Icon className="h-3 w-3" strokeWidth={3} fill={step.state === "current" ? "currentColor" : "none"} />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={`text-sm font-medium ${labelColor}`}>{step.label}</p>
              {step.timestamp && <p className="mt-0.5 text-xs text-slate-400">{formatTime(step.timestamp)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}