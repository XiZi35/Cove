"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
} from "viem";
import { PAYMENT_CONTRACT_ADDRESS, PAYMENT_ABI } from "@/lib/contract";
import { ARC_TESTNET } from "@/lib/arc";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function WithdrawPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [done, setDone] = useState(false);

  const handleWithdraw = async () => {
    if (!window.ethereum) {
      setError("请先安装 MetaMask");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("正在连接钱包...");

    try {
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

      setStatus("请在钱包中确认提现...");

      const hash = await (walletClient as any).writeContract({
        address: PAYMENT_CONTRACT_ADDRESS,
        abi: PAYMENT_ABI,
        functionName: "withdraw",
        args: [],
        chain: ARC_TESTNET,
        account,
      });

      setStatus("等待交易确认...");
      await publicClient.waitForTransactionReceipt({ hash });

      setTxHash(hash);
      setDone(true);
      setStatus("");
    } catch (err: any) {
      console.error(err);
      setError(err?.shortMessage || err?.message || "提现失败");
      setStatus("");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-xl font-semibold text-slate-900">提现</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            将合约中的商户余额提取到你的钱包
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          {done ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-medium text-slate-900">提现成功</h2>
              {txHash && (
                <a
                  href={`https://testnet.arcscan.app/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-teal-700 hover:underline"
                >
                  在浏览器查看交易 →
                </a>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 leading-relaxed">
                点击下方按钮，使用 MetaMask 调用合约的{" "}
                <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                  withdraw
                </code>{" "}
                方法，将你在 PaymentReceiver 合约中的余额提到当前钱包地址。
              </p>
              <p className="text-xs text-slate-400">
                注意：只有通过本合约收款产生的余额才能提取；直接转到钱包地址的
                USDC 不需要经此操作。
              </p>

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
                onClick={handleWithdraw}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  "连接钱包并提现"
                )}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}