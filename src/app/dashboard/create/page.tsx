"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Link2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreatePaymentPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentLink, setPaymentLink] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("arcpay_user_email")) {
      window.location.href = "/login";
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setLoading(true);
    setError("");

    try {
      const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      let merchantAddress = "";
      try {
        const w = localStorage.getItem("arcpay_wallet");
        if (w) merchantAddress = JSON.parse(w).address || "";
      } catch {}

      if (!merchantAddress) {
        throw new Error("未找到收款钱包，请重新登录");
      }

      const payload = {
        id,
        amount,
        description,
        merchantAddress,
      };

      const encoded = btoa(
        unescape(encodeURIComponent(JSON.stringify(payload)))
      );
      const link = `${window.location.origin}/pay/${id}?d=${encoded}`;

      const orderData = {
        ...payload,
        createdAt: new Date().toISOString(),
        paid: false,
      };
      localStorage.setItem(`arcpay_order_${id}`, JSON.stringify(orderData));

      setPaymentLink(link);
      setCreated(true);
    } catch (err: any) {
      setError(err.message || "创建失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewAmount = amount || "0.00";
  const previewDesc = description || "订单说明";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            返回后台
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-slate-900">创建支付链接</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            设置金额和说明，生成收款链接
          </p>
        </div>

        {!created ? (
          <div className="space-y-6">
            <form
              onSubmit={handleCreate}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  收款金额 (USDC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 disabled:opacity-50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    USDC
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  订单说明
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="例如：咨询费用、设计服务..."
                  required
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !amount || !description}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    生成支付链接
                  </>
                )}
              </button>
            </form>

            {/* 客户预览 */}
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2 px-1">
                客户将看到
              </p>
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-5 opacity-90">
                <div className="text-center mb-4">
                  <div className="inline-flex w-10 h-10 rounded-xl bg-teal-700 text-white text-sm font-bold items-center justify-center mb-2">
                    A
                  </div>
                  <p className="text-xs text-slate-400">ArcPay 安全收款</p>
                </div>
                <p className="text-xs text-slate-400 mb-1">支付金额</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {previewAmount}{" "}
                  <span className="text-sm font-medium text-slate-500">
                    USDC
                  </span>
                </p>
                <p className="text-sm text-slate-600 mt-1">{previewDesc}</p>
                <div className="mt-4 h-10 rounded-xl bg-teal-700/90 text-white text-sm flex items-center justify-center">
                  连接钱包并支付 {previewAmount} USDC
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-medium text-slate-900">链接已生成</h2>
              <p className="text-sm text-slate-500 mt-1">
                {description} · {amount} USDC
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 mb-2">支付链接</p>
              <p className="text-sm font-mono text-slate-700 break-all">
                {paymentLink}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50"
              >
                <Copy className="w-4 h-4" />
                {copied ? "已复制" : "复制链接"}
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800"
              >
                返回后台
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}