"use client";

import { useState } from "react";
import { ArrowLeft, Link2, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseUnits,
  keccak256,
  toBytes,
} from "viem";
import {
  PAYMENT_CONTRACT_ADDRESS,
  PAYMENT_ABI,
} from "@/lib/contract";
import { ARC_TESTNET } from "@/lib/arc";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function CreatePaymentPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [txHash, setTxHash] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    if (!window.ethereum) {
      setError("请先安装 MetaMask");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("正在连接钱包...");

    try {
      // 切换到 Arc Testnet
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x4CEF52" }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x4CEF52",
                chainName: "Arc Testnet",
                nativeCurrency: {
                  name: "USDC",
                  symbol: "USDC",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.testnet.arc.io"],
                blockExplorerUrls: ["https://testnet.arcscan.app"],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0] as `0x${string}`;

      const walletClient = createWalletClient({
        account,
        chain: ARC_TESTNET as any,
        transport: custom(window.ethereum),
      });

      const publicClient = createPublicClient({
        chain: ARC_TESTNET as any,
        transport: http("https://rpc.testnet.arc.io"),
      });

      // 生成 orderId
      const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const orderIdBytes32 = keccak256(toBytes(id));
      const amountInUnits = parseUnits(amount, 6); // USDC 6 decimals

      setStatus("请在钱包中确认创建订单...");

            const hash = await (walletClient as any).writeContract({
        address: PAYMENT_CONTRACT_ADDRESS,
        abi: PAYMENT_ABI,
        functionName: "createOrder",
        args: [orderIdBytes32, amountInUnits, description],
        chain: ARC_TESTNET,
        account,
      });

      setStatus("等待交易确认...");
      await publicClient.waitForTransactionReceipt({ hash });

      setTxHash(hash);

      const link = `${window.location.origin}/pay/${id}`;

      // 本地也存一份，方便支付页读取
      const orderData = {
        id,
        amount,
        description,
        createdAt: new Date().toISOString(),
        paid: false,
        txHash: hash,
        orderIdBytes32,
      };
      localStorage.setItem(`arcpay_order_${id}`, JSON.stringify(orderData));

      setPaymentLink(link);
      setCreated(true);
      setStatus("");
    } catch (err: any) {
      console.error(err);
      setError(err?.shortMessage || err?.message || "创建订单失败");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
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
            设置金额和说明，生成专属收款链接（会写入链上）
          </p>
        </div>

        {!created ? (
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all text-sm disabled:opacity-50"
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
                placeholder="例如：网站设计服务、咨询费用..."
                required
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all text-sm disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {status && !error && (
              <p className="text-sm text-teal-600 text-center">{status}</p>
            )}

            <button
              type="submit"
              disabled={loading || !amount || !description}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm transition-all shadow-sm shadow-teal-700/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  生成支付链接（上链）
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-medium text-slate-900">
                链上订单已创建
              </h2>
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

            {txHash && (
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-teal-700 hover:underline"
              >
                在浏览器查看创建交易 →
              </a>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-all"
              >
                <Copy className="w-4 h-4" />
                {copied ? "已复制" : "复制链接"}
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm transition-all"
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