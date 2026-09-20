import { Headset, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Reveal } from "./Reveal";

const benefits = [
  { icon: Truck, title: "Free delivery", text: "On all orders over $50", tint: "bg-brand-light text-brand" },
  { icon: ShieldCheck, title: "Secure checkout", text: "Encrypted & protected payments", tint: "bg-emerald-50 text-emerald-600" },
  { icon: RotateCcw, title: "Easy returns", text: "30-day hassle-free returns", tint: "bg-violet-50 text-violet-600" },
  { icon: Headset, title: "24/7 support", text: "Real people, always around", tint: "bg-amber-50 text-amber-600" },
];

export function BenefitsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 0.05}>
              <div className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_32px_-20px_rgba(17,24,39,.2)]">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${benefit.tint}`}>
                  <benefit.icon className="h-5 w-5" />
                </span>
                <span>
                  <h3 className="text-[15px] font-bold text-ink">{benefit.title}</h3>
                  <p className="mt-1 text-[13px] leading-5 text-slate-500">{benefit.text}</p>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}