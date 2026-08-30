import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center text-sm font-bold">
              A
            </div>
            <span className="font-semibold text-slate-900">ArcPay</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            登录
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-sm font-medium text-teal-700 mb-4">
          Built on Arc · Powered by USDC
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
          让加密支付
          <br />
          像传统支付一样简单
        </h1>
        <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto">
          邮箱登录即可开通 USDC 收款。生成支付链接，分享给客户，即时到账。
          无需助记词，无需懂区块链。
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm shadow-sm shadow-teal-700/20 transition-all"
          >
            立即开始
          </Link>
          <a
            href="https://testnet.arcscan.app/address/0xde8d06fbc604a4a43b797c5e83cbee1f4b527388"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-white transition-all"
          >
            查看合约
          </a>
        </div>

        {/* Features */}
        <div className="mt-20 grid sm:grid-cols-3 gap-6 text-left">
          {[
            {
              title: "邮箱即可开通",
              desc: "登录后自动创建 Circle 钱包，无需助记词与私钥管理。",
            },
            {
              title: "支付链接收款",
              desc: "设置金额与说明，一键生成链接，客户打开即可支付 USDC。",
            },
            {
              title: "Arc 原生结算",
              desc: "基于 Arc Testnet，USDC 作为结算与 Gas 资产，秒级确认。",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
              <h3 className="font-medium text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-16 text-xs text-slate-400">
          Working prototype on Arc Testnet · Not production financial software
        </p>
      </main>
    </div>
  );
}