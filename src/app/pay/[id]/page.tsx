"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseUnits,
  encodeFunctionData,
  keccak256,
  toBytes,
} from "viem";
import {
  PAYMENT_CONTRACT_ADDRESS,
  PAYMENT_ABI,
  USDC_ADDRESS,
  USDC_ABI,
} from "@/lib/contract";
import { ARC_TESTNET } from "@/lib/arc";

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
  } | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    if (!orderIdParam) return;
    const raw = localStorage.getItem(`arcpay_order_${orderIdParam}`);
    if (raw) {
      const data = JSON.parse(raw);
      setOrder({
        amount: data.amount,
        description: data.description,
        paid: data.paid || false,
      });
      if (data.paid) setPaid(true);
    } else {
      setOrder({
        amount: "1.00",
        description: "演示订单",
        paid: false,
      });
    }
  }, [orderIdParam]);

  const handlePay = async () => {
    if (!order || !window.ethereum) {
      setError("请先安装 MetaMask");
      return;
    }

    setPaying(true);
    setError("");
    setStatus("正在连接钱包...");

    try {
      // 1. 切换到 Arc Testnet
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

      // USDC 在 Arc 上 ERC-20 接口是 6 位小数
      const amountInUnits = parseUnits(order.amount, 6);

      // 把字符串 orderId 转成 bytes32
      const orderIdBytes32 = keccak256(toBytes(orderIdParam));

      // 2. 先调用 createOrder（如果订单还不存在）
      // 为简化演示，这里由付款人直接 pay。正式产品应由商户先 createOrder。
      // 我们先尝试直接 pay，如果订单不存在会失败，所以这里先做 approve + 提示。

      setStatus("请在钱包中确认授权 USDC...");

      // 3. approve
           const approveHash = await (walletClient as any).writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "approve",
        args: [PAYMENT_CONTRACT_ADDRESS, amountInUnits],
        chain: ARC_TESTNET,
        account,
      });

      setStatus("等待授权确认...");
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      setStatus("请在钱包中确认支付...");

      // 4. 调用 pay
      // 注意：合约要求订单先被 createOrder。为了演示能跑通，
      // 如果 pay 失败，我们会提示需要先由商户创建链上订单。
            const payHash = await (walletClient as any).writeContract({
        address: PAYMENT_CONTRACT_ADDRESS,
        abi: PAYMENT_ABI,
        functionName: "pay",
        args: [orderIdBytes32],
        chain: ARC_TESTNET,
        account,
      });

      setStatus("等待支付确认...");
      await publicClient.waitForTransactionReceipt({ hash: payHash });

      setTxHash(payHash);

      // 更新本地状态
      const raw = localStorage.getItem(`arcpay_order_${orderIdParam}`);
      if (raw) {
        const data = JSON.parse(raw);
        data.paid = true;
        data.txHash = payHash;
        localStorage.setItem(
          `arcpay_order_${orderIdParam}`,
          JSON.stringify(data)
        );
      }

      setPaid(true);
      setStatus("");
    } catch (err: any) {
      console.error(err);
      const msg = err?.shortMessage || err?.message || "支付失败";
      setError(msg);
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
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-5">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            支付成功
          </h1>
          <p className="text-slate-500 mb-1">
            你已成功支付{" "}
            <span className="font-medium text-slate-800">
              {order.amount} USDC
            </span>
          </p>
          <p className="text-sm text-slate-400 mb-6">{order.description}</p>

          {txHash && (
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-teal-700 hover:underline mb-6"
            >
              在浏览器查看交易 →
            </a>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-left shadow-sm">
            <p className="text-xs text-slate-400 mb-1">收款合约</p>
            <p className="text-sm font-mono text-slate-700 break-all">
              {PAYMENT_CONTRACT_ADDRESS}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-700 text-white text-lg font-bold mb-3 shadow-lg shadow-teal-700/20">
            A
          </div>
          <p className="text-sm text-slate-500">ArcPay 安全收款</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <p className="text-sm text-slate-500 mb-1">支付金额</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-slate-900 tracking-tight">
                {order.amount}
              </span>
              <span className="text-base text-slate-500 font-medium">USDC</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{order.description}</p>
          </div>

          <div className="p-6 space-y-4">
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
              onClick={handlePay}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm transition-all disabled:opacity-60 shadow-sm shadow-teal-700/20"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  连接钱包并支付
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>支付将在 Arc 测试网完成 · 秒级确认</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}