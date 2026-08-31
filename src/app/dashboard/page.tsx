"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  Plus,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle2,
  LogOut,
  Loader2,
  RefreshCw,
  ArrowDownToLine,
  Link2,
} from "lucide-react";

type Order = {
  id: string;
  amount: string;
  description: string;
  createdAt: string;
  paid: boolean;
  txHash?: string;
  merchantAddress?: string;
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("加载中...");
  const [fullWalletAddress, setFullWalletAddress] = useState("");
  const [walletId, setWalletId] = useState("");
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const loadBalance = async (id: string) => {
    if (!id) return;
    setBalanceLoading(true);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getBalance", walletId: id }),
      });
      const data = await res.json();
      const tokens = data?.tokenBalances || data?.data?.tokenBalances || [];
      const usdc = tokens.find((t: any) =>
        (t.token?.symbol || t.symbol || "").toUpperCase().includes("USDC")
      );
      setUsdcBalance(usdc ? usdc.amount || usdc.balance || "0" : "0");
    } catch {
      setUsdcBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("arcpay_user_email");
    if (!savedEmail) {
      window.location.href = "/login";
      return;
    }
    setEmail(savedEmail);

    try {
      const walletRaw = localStorage.getItem("arcpay_wallet");
      if (walletRaw) {
        const wallet = JSON.parse(walletRaw);
        if (wallet.address) {
          setFullWalletAddress(wallet.address);
          setWalletAddress(
            wallet.address.slice(0, 6) + "..." + wallet.address.slice(-4)
          );
        }
        if (wallet.walletId) {
          setWalletId(wallet.walletId);
          loadBalance(wallet.walletId);
        }
      }
    } catch {}

    const allOrders: Order[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("arcpay_order_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          if (data.id) {
            allOrders.push({
              id: data.id,
              amount: data.amount,
              description: data.description,
              createdAt: data.createdAt,
              paid: data.paid || false,
              txHash: data.txHash,
              merchantAddress: data.merchantAddress,
            });
          }
        } catch {}
      }
    }
    allOrders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setOrders(allOrders);
    setLoading(false);
  }, []);

  const totalPaid = orders
    .filter((o) => o.paid)
    .reduce((sum, o) => sum + parseFloat(o.amount || "0"), 0)
    .toFixed(2);

  const pendingCount = orders.filter((o) => !o.paid).length;

  const handleCopy = () => {
    if (!fullWalletAddress) return;
    navigator.clipboard.writeText(fullWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = (order: Order) => {
    const payload = {
      id: order.id,
      amount: order.amount,
      description: order.description,
      merchantAddress: order.merchantAddress || fullWalletAddress,
    };
    const encoded = btoa(
      unescape(encodeURIComponent(JSON.stringify(payload)))
    );
    const link = `${window.location.origin}/pay/${order.id}?d=${encoded}`;
    navigator.clipboard.writeText(link);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(""), 2000);
  };

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diff < 60) return "刚刚";
      if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
      return date.toLocaleDateString("zh-CN");
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center text-sm font-bold">
              A
            </div>
            <span className="font-semibold text-slate-900">ArcPay</span>
          </div>
          <div className="flex items-center gap-4">
            {email && (
              <span className="text-sm text-slate-500 hidden sm:block">
                {email}
              </span>
            )}
            <button
              onClick={() => {
                localStorage.removeItem("arcpay_user_email");
                window.location.href = "/login";
              }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">收款工作台</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              管理支付链接与到账记录 · Arc Testnet
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/dashboard/create")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium shadow-sm shadow-teal-700/20"
          >
            <Plus className="w-4 h-4" />
            创建支付链接
          </button>
        </div>

        {/* 概览 */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">钱包余额</p>
            <p className="text-2xl font-semibold text-slate-900">
              {balanceLoading
                ? "..."
                : usdcBalance !== null
                ? usdcBalance
                : "—"}{" "}
              <span className="text-sm font-medium text-slate-500">USDC</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">已确认收款</p>
            <p className="text-2xl font-semibold text-slate-900">
              {totalPaid}{" "}
              <span className="text-sm font-medium text-slate-500">USDC</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">待支付订单</p>
            <p className="text-2xl font-semibold text-slate-900">
              {pendingCount}{" "}
              <span className="text-sm font-medium text-slate-500">笔</span>
            </p>
          </div>
        </div>

        {/* 钱包卡片 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">收款钱包</p>
                <p className="text-xs text-slate-400">Circle · Arc Testnet</p>
              </div>
            </div>
            <button
              onClick={() => walletId && loadBalance(walletId)}
              className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-600 ${
                  balanceLoading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
          <p className="text-sm font-mono text-slate-700 break-all mb-4">
            {fullWalletAddress || walletAddress}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              disabled={!fullWalletAddress}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "已复制" : "复制地址"}
            </button>
            {fullWalletAddress && (
              <a
                href={`https://testnet.arcscan.app/address/${fullWalletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                浏览器
              </a>
            )}
            <a
              href="/dashboard/withdraw"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 text-white text-sm hover:bg-teal-800"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              提现
            </a>
          </div>
        </div>

        {/* 订单 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-medium text-slate-900">订单与交易</h2>
            <span className="text-xs text-slate-400">共 {orders.length} 笔</span>
          </div>

          {loading ? (
            <div className="px-6 py-12 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-teal-700" />
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500 mb-3">
                还没有收款订单。创建第一笔支付链接，开始接收 USDC。
              </p>
              <button
                onClick={() => (window.location.href = "/dashboard/create")}
                className="text-sm text-teal-700 font-medium hover:underline"
              >
                去创建 →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        order.paid
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {order.paid ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {order.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatTime(order.createdAt)}
                        {order.txHash && (
                          <>
                            {" · "}
                            <a
                              href={`https://testnet.arcscan.app/tx/${order.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-700 hover:underline"
                            >
                              查看交易
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 sm:ml-4">
                    {!order.paid && (
                      <button
                        onClick={() => handleCopyLink(order)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-teal-700"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        {copiedOrderId === order.id ? "已复制" : "复制链接"}
                      </button>
                    )}
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {order.paid ? "+" : ""}
                        {order.amount} USDC
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          order.paid ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {order.paid ? "已支付" : "待支付"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}