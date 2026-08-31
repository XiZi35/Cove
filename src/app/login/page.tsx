"use client";

import { useEffect, useState } from "react";
import { Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { ArcPayLogo } from "@/components/Logo";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import {
  type Locale,
  t,
  getStoredLocale,
  setStoredLocale,
} from "@/lib/i18n";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [locale, setLocale] = useState<Locale>("zh");

  useEffect(() => {
    setLocale(getStoredLocale());
  }, []);

  const switchLocale = (l: Locale) => {
    setLocale(l);
    setStoredLocale(l);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setStatus(t(locale, "loginBtn") + "...");

    try {
      const existing = localStorage.getItem(`arcpay_wallet_${email}`);
      if (existing) {
        localStorage.setItem("arcpay_user_email", email);
        localStorage.setItem("arcpay_wallet", existing);
        window.location.href = "/dashboard";
        return;
      }

      setStatus(t(locale, "loginCreating"));

      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createWallet", email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed");
      }

      const walletInfo = JSON.stringify({
        walletId: data.walletId,
        address: data.address,
        blockchain: data.blockchain,
        walletSetId: data.walletSetId,
      });

      localStorage.setItem("arcpay_user_email", email);
      localStorage.setItem("arcpay_wallet", walletInfo);
      localStorage.setItem(`arcpay_wallet_${email}`, walletInfo);

      setStatus(t(locale, "loginOk"));
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 600);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="px-4 h-14 flex items-center justify-end max-w-md mx-auto w-full">
        <LanguageSwitch locale={locale} onChange={switchLocale} />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <ArcPayLogo size={48} />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              ArcPay
            </h1>
            <p className="mt-2 text-slate-500 text-sm">
              {t(locale, "heroTitle1")}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-slate-900">
                {t(locale, "loginTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {t(locale, "loginSub")}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t(locale, "emailLabel")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t(locale, "emailPlaceholder")}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 break-all">{error}</p>
              )}
              {status && !error && (
                <p className="text-sm text-teal-600">{status}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm transition-all disabled:opacity-50 shadow-sm shadow-teal-700/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t(locale, "paying")}
                  </>
                ) : (
                  <>
                    {t(locale, "loginBtn")}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t(locale, "loginShield")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}