"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { addToast } from "@heroui/toast";
import { ArrowUpRight, Check, Mail, Send, ShieldCheck, UserRound } from "lucide-react";
import { Reveal } from "./Reveal";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      addToast({ title: "Please enter a valid email", description: "Double-check your address and try again.", color: "danger", timeout: 3000 });
      return;
    }
    setSubscribed(true);
    addToast({ title: "You're on the list!", description: "Welcome to IndigoStore — watch your inbox.", color: "success", timeout: 3000 });
  }

  return (
    <section aria-labelledby="newsletter-heading" className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[32px] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/50 to-violet-50/70 px-6 py-10 shadow-[0_20px_60px_-20px_rgba(79,70,229,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-10 md:py-12 xl:px-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
              <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
            </div>

            <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 xl:gap-24">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700 backdrop-blur-sm">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  Newsletter
                </span>
                <h2 id="newsletter-heading" className="mt-5 font-display text-[2rem] font-bold leading-[1.1] tracking-[-0.045em] text-slate-950 sm:text-[2.625rem] xl:text-[2.875rem]">
                  Be the first <span className="block">to know.</span>
                </h2>
                <p className="mt-4 max-w-sm text-[15px] leading-7 text-slate-600 sm:text-base">
                  Get early access to new arrivals, exclusive offers and special discounts.
                </p>
                <p className="mt-5 flex items-start gap-2 text-sm leading-5 text-slate-500">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
                  No spam. Unsubscribe anytime.
                </p>
              </div>

              <div className="relative min-w-0">
                <div aria-hidden="true" className="pointer-events-none absolute -left-8 -top-4 -bottom-4 hidden w-px bg-gradient-to-b from-transparent via-indigo-200/80 to-transparent lg:block xl:-left-12" />
                {subscribed ? (
                  <div role="status" className="flex min-h-14 items-center gap-3 rounded-2xl border border-emerald-200 bg-white/85 px-4 py-3 text-emerald-800 shadow-sm backdrop-blur-sm">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-600 text-white"><Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" /></span>
                    <span className="text-sm font-semibold">You&apos;re subscribed. Welcome aboard!</span>
                  </div>
                ) : (
                  <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
                    <label className="flex h-14 min-w-0 items-center gap-2.5 rounded-2xl border border-indigo-100 bg-white/95 px-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)] transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 sm:flex-1">
                      <Mail className="h-4 w-4 shrink-0 text-indigo-400" aria-hidden="true" />
                      <input
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Enter your email address"
                        aria-label="Email address"
                        className="w-full min-w-0 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500 sm:text-sm"
                      />
                    </label>
                    <button
                      type="submit"
                      className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(79,70,229,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-6px_rgba(79,70,229,0.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2 motion-reduce:hover:translate-y-0 xl:px-6"
                    >
                      Subscribe
                      <Send className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </form>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div aria-hidden="true" className="flex shrink-0 -space-x-2">
                    <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-indigo-100 text-indigo-500"><UserRound className="h-4 w-4" /></span>
                    <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-violet-100 text-violet-500"><UserRound className="h-4 w-4" /></span>
                    <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-slate-100 text-slate-500"><UserRound className="h-4 w-4" /></span>
                  </div>
                  <p className="min-w-0 flex-[1_1_12rem] text-sm leading-6 text-slate-600">Join thousands of shoppers receiving our latest updates.</p>
                </div>
                <p className="mt-6 border-t border-indigo-200/60 pt-5 text-sm leading-6 text-slate-600">
                  New to IndigoStore?{" "}
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-0.5 rounded-sm font-semibold text-indigo-600 underline decoration-indigo-300 underline-offset-4 transition-colors duration-200 hover:text-indigo-800 hover:decoration-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    Sign up
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
