"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArcPayLogo } from "@/components/Logo";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import {
  type Locale,
  t,
  getStoredLocale,
  setStoredLocale,
} from "@/lib/i18n";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("zh");

  useEffect(() => {
    setLocale(getStoredLocale());
  }, []);

  const switchLocale = (l: Locale) => {
    setLocale(l);
    setStoredLocale(l);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <ArcPayLogo size={28} withWordmark />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
              {t(locale, "testnetBadge")}
            </span>
            <LanguageSwitch locale={locale} onChange={switchLocale} />
            <Link
              href="/login"
              className="text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              {t(locale, "navLogin")}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-5xl mx-auto px-4 py-20 text-center">
          <p className="text-sm font-medium text-teal-700 mb-4">
            {t(locale, "brandTag")}
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
            {t(locale, "heroTitle1")}
            <br />
            {t(locale, "heroTitle2")}
          </h1>
          <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto">
            {t(locale, "heroSub")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm shadow-sm shadow-teal-700/20"
            >
              {t(locale, "ctaStart")}
            </Link>
            <a
              href="https://testnet.arcscan.app/address/0xde8d06fbc604a4a43b797c5e83cbee1f4b527388"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-white"
            >
              {t(locale, "ctaContract")}
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            {t(locale, "testnetNote")}
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid sm:grid-cols-3 gap-6">
            {(
              [
                ["feature1Title", "feature1Desc"],
                ["feature2Title", "feature2Desc"],
                ["feature3Title", "feature3Desc"],
              ] as const
            ).map(([title, desc]) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
              >
                <h3 className="font-medium text-slate-900">
                  {t(locale, title)}
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  {t(locale, desc)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border-y border-slate-200 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-semibold text-slate-900 text-center mb-10">
              {t(locale, "stepsTitle")}
            </h2>
            <div className="grid sm:grid-cols-4 gap-6 text-center">
              {(
                ["step1", "step2", "step3", "step4"] as const
              ).map((step, i) => (
                <div key={step}>
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 font-semibold text-sm flex items-center justify-center mx-auto mb-3">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    {t(locale, step)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 text-center mb-10">
            {t(locale, "faqTitle")}
          </h2>
          <div className="space-y-4">
            {(
              [
                ["faq1q", "faq1a"],
                ["faq2q", "faq2a"],
                ["faq3q", "faq3a"],
                ["faq4q", "faq4a"],
              ] as const
            ).map(([q, a]) => (
              <div
                key={q}
                className="bg-white rounded-xl border border-slate-200 p-5"
              >
                <p className="font-medium text-slate-900 text-sm">
                  {t(locale, q)}
                </p>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                  {t(locale, a)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>{t(locale, "footerNote")}</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-600">
              {t(locale, "navApp")}
            </Link>
            <a
              href="https://testnet.arcscan.app/address/0xde8d06fbc604a4a43b797c5e83cbee1f4b527388"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600"
            >
              Contract
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}