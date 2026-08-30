"use client";

import { useState } from "react";
import { Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setStatus("正在登录...");

    try {
      // 已有钱包则直接进入
      const existing = localStorage.getItem(`arcpay_wallet_${email}`);
      if (existing) {
        localStorage.setItem("arcpay_user_email", email);
        localStorage.setItem("arcpay_wallet", existing);
        window.location.href = "/dashboard";
        return;
      }

      setStatus("正在为你创建收款钱包...");

      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createWallet", email }),
      });

      const data = await res.json();
      console.log("createWallet response:", data);

      if (!res.ok) {
        throw new Error(data.error || data.message || "创建钱包失败");
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

      setStatus("钱包创建成功，正在跳转...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 600);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-700 text-white text-2xl font-bold mb-4 shadow-lg shadow-teal-700/20">
            A
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            ArcPay
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            让加密支付像传统支付一样简单
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-slate-900">邮箱登录</h2>
            <p className="mt-1 text-sm text-slate-500">
              首次登录将自动创建 Arc 收款钱包
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-teal-700/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  进入后台
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>钱包由 Circle Developer-Controlled 创建</span>
        </div>
      </div>
    </div>
  );
}