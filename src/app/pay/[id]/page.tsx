"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseUnits,
} from "viem";
import { USDC_ADDRESS } from "@/lib/contract";
import { ARC_TESTNET } from "@/lib/arc";
import { ArcPayLogo } from "@/components/Logo";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import {
  type Locale,
  t,
  getStoredLocale,
  setStoredLocale,
} from "@/lib/i18n";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function PayPage() {
  const params = useParams();
  const orderIdParam = params.id as string;

  const [order, setOrder] = useState<{
    amount: string;
    description: string;
    paid: boolean;
    merchantAddress?: string;
  } | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [locale, setLocale] = useState<Locale>("zh");

  useEffect(() => {
    setLocale(getStoredLocale());
  }, []);

  useEffect(() => {
    if (!orderIdParam) return;

    const load = async () => {
      // 1. URL payload
      try {
        const sp = new URLSearchParams(window.location.search);
        const d = sp.get("d");
        if (d) {
          const data = JSON.parse(decodeURIComponent(escape(atob(d))));
          setOrder({
            amount: String(data.amount),
            description: data.description || "",
            paid: false,
            merchantAddress: data.merchantAddress,
          });
          return;
        }
      } catch (e) {
        console.warn("parse url payload failed", e);
      }

      // 2. localStorage
      try {
        const raw = localStorage.getItem(`arcpay_order_${orderIdParam}`);
        if (raw) {
          const data = JSON.parse(raw);
          setOrder({
            amount: String(data.amount),
            description: data.description || "",
            paid: data.paid || false,
            merchantAddress: data.merchantAddress,
          });
          if (data.paid) {
            setPaid(true);
            if (data.txHash) setTxHash(data.txHash);
          }
          return;
        }
      } catch {}

      // 3. server
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get", id: orderIdParam }),
        });
        if (res.ok) {
          const { order: data } = await res.json();
          if (data) {
            setOrder({
              amount: String(data.amount),
              description: data.description || "",
              paid: data.paid || false,
              merchantAddress: data.merchantAddress,
            });
            if (data.paid) {
              setPaid(true);
              if (data.txHash) setTxHash(data.txHash);
            }
            return;
          }
        }
      } catch {}

      setError(
        locale === "zh"
          ? "订单不存在或链接无效，请让商户重新生成支付链接"
          : "Invalid or missing order. Ask the merchant for a new link."
      );
      setOrder({ amount: "0", description: "—", paid: false });
    };

    load();
  }, [orderIdParam, locale]);

  const switchLocale = (l: Locale) => {
    setLocale(l);
    setStoredLocale(l);
  };

  const ensureArcNetwork = async () => {
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
  };

  const handleCopyAddress = () => {
    if (!order?.merchantAddress) return;
    navigator.clipboard.writeText(order.merchantAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePay = async () => {
    if (!order) return;
    if (!window.ethereum) {
      setError(t(locale, "noWallet"));
      return;
    }

    setPaying(true);
    setError("");
    setStatus(locale === "zh" ? "正在连接钱包..." : "Connecting wallet...");

    try {
      await ensureArcNetwork();

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

      const to = order.merchantAddress as `0x${string}` | undefined;
      if (!to || !to.startsWith("0x") || to.length < 42) {
        throw new Error(
          locale === "zh"
            ? "商户收款地址无效，请重新生成支付链接"
            : "Invalid merchant address. Request a new payment link."
        );
      }

      const amountInUnits = parseUnits(order.amount, 6);

      setStatus(
        locale === "zh"
          ? "请在 MetaMask 中确认转账..."
          : "Confirm the transfer in MetaMask..."
      );

      const hash = await (walletClient as any).writeContract({
        address: USDC_ADDRESS,
        abi: [
          {
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            name: "transfer",
            outputs: [{ name: "", type: "bool" }],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "transfer",
        args: [to, amountInUnits],
        chain: ARC_TESTNET,
        account,
      });

      setStatus(
        locale === "zh" ? "等待链上确认..." : "Waiting for confirmation..."
      );
      await publicClient.waitForTransactionReceipt({ hash });
      setTxHash(hash);

      try {
        const raw = localStorage.getItem(`arcpay_order_${orderIdParam}`);
        if (raw) {
          const data = JSON.parse(raw);
          data.paid = true;
          data.txHash = hash;
          localStorage.setItem(
            `arcpay_order_${orderIdParam}`,
            JSON.stringify(data)
          );
        }
      } catch {}

      try {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "markPaid",
            id: orderIdParam,
            txHash: hash,
          }),
        });
      } catch {}

      setPaid(true);
      setStatus("");
    } catch (err: any) {
      console.error(err);
      setError(err?.shortMessage || err?.message || "Payment failed");
      setStatus("");
    } finally {
      setPaying(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
      </div>
    );
  }

  if (paid) {
    const receiptText = [
      "Cove Receipt / 支付凭证",
      `${locale === "zh" ? "金额" : "Amount"}: ${order.amount} USDC`,
      `${locale === "zh" ? "说明" : "Memo"}: ${order.description}`,
      `${locale === "zh" ? "收款地址" : "To"}: ${order.merchantAddress || ""}`,
      txHash ? `Tx: ${txHash}` : "",
      txHash ? `https://testnet.arcscan.app/tx/${txHash}` : "",
      "Network: Arc Testnet",
    ]
      .filter(Boolean)
      .join("\n");

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="px-4 h-14 flex items-center justify-end max-w-md mx-auto w-full">
          <LanguageSwitch locale={locale} onChange={switchLocale} />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-5">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                {t(locale, "success")}
              </h1>
              <p className="text-slate-500">
                {t(locale, "paidPrefix")}{" "}
                <span className="font-medium text-slate-800">
                  {order.amount} USDC
                </span>
              </p>
              <p className="text-sm text-slate-400 mt-1">{order.description}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">{t(locale, "network")}</span>
                <span className="font-medium text-slate-800">Arc Testnet</span>
              </div>
              <div className="flex justify-between gap-2 items-start">
                <span className="text-slate-500 shrink-0">
                  {t(locale, "payTo")}
                </span>
                <span className="font-mono text-xs text-slate-700 text-right break-all">
                  {order.merchantAddress || "—"}
                </span>
              </div>
              {txHash && (
                <div className="flex justify-between gap-2 items-start">
                  <span className="text-slate-500 shrink-0">Tx</span>
                  <span className="font-mono text-xs text-slate-700 text-right break-all">
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {txHash && (
                <a
                  href={`https://testnet.arcscan.app/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-white"
                >
                  {t(locale, "viewTx")}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(receiptText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? t(locale, "receiptCopied") : t(locale, "copyReceipt")}
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              {t(locale, "testnetFoot")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="px-4 h-14 flex items-center justify-end max-w-md mx-auto w-full">
        <LanguageSwitch locale={locale} onChange={switchLocale} />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <ArcPayLogo size={48} />
            </div>
            <p className="text-sm text-slate-500">{t(locale, "paySecure")}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <p className="text-sm text-slate-500 mb-1">
                {t(locale, "payAmount")}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-slate-900">
                  {order.amount}
                </span>
                <span className="text-base text-slate-500 font-medium">
                  USDC
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{order.description}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">{t(locale, "network")}</span>
                  <span className="font-medium text-slate-800">Arc Testnet</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">{t(locale, "asset")}</span>
                  <span className="font-medium text-slate-800">USDC</span>
                </div>
                <div className="flex justify-between gap-3 items-start">
                  <span className="text-slate-500 shrink-0">
                    {t(locale, "payTo")}
                  </span>
                  <div className="text-right min-w-0">
                    <p className="font-mono text-xs text-slate-800 break-all">
                      {order.merchantAddress || "—"}
                    </p>
                    {order.merchantAddress && (
                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-teal-700 hover:underline"
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? t(locale, "copied") : t(locale, "copyAddr")}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">{t(locale, "settle")}</span>
                  <span className="font-medium text-slate-800">
                    {t(locale, "settleValue")}
                  </span>
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                />
                <span className="text-xs text-slate-500 leading-relaxed">
                  {t(locale, "payConfirm")}
                </span>
              </label>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="break-all">{error}</span>
                </div>
              )}
              {status && !error && (
                <p className="text-sm text-teal-600 text-center">{status}</p>
              )}

              <button
                onClick={handlePay}
                disabled={paying || order.amount === "0" || !confirmed}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm transition-all disabled:opacity-50 shadow-sm shadow-teal-700/20"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t(locale, "paying")}
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    {t(locale, "payBtn")} {order.amount} USDC
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t(locale, "testnetFoot")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}