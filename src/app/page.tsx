import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center text-sm font-bold">
              A
            </div>
            <span className="font-semibold text-slate-900">ArcPay</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
              Arc Testnet
            </span>
            <Link
              href="/login"
              className="text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              登录
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-5xl mx-auto px-4 py-20 text-center">
          <p className="text-sm font-medium text-teal-700 mb-4">
            Built on Arc · Settled in USDC
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
            邮箱开通，链接收款
            <br />
            USDC 即时到账
          </h1>
          <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto">
            面向创业者与企业的 USDC 收款工具。无需助记词，无需懂链。
            创建支付链接，分享给客户，资金直达你的钱包。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm shadow-sm shadow-teal-700/20"
            >
              免费体验收款
            </Link>
            <a
              href="https://testnet.arcscan.app/address/0xde8d06fbc604a4a43b797c5e83cbee1f4b527388"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-white"
            >
              查看合约
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            当前为 Testnet 工作原型 · 请使用测试 USDC
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: "邮箱即可开通",
                desc: "登录后自动创建 Circle 收款钱包，无需助记词与私钥管理。",
              },
              {
                title: "支付链接收款",
                desc: "设置金额与说明，一键生成链接。客户打开即可支付 USDC。",
              },
              {
                title: "资金直达钱包",
                desc: "USDC 直接转入你的地址，平台不经手。Arc 上秒级确认。",
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
        </section>

        <section className="bg-white border-y border-slate-200 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-semibold text-slate-900 text-center mb-10">
              四步完成一笔收款
            </h2>
            <div className="grid sm:grid-cols-4 gap-6 text-center">
              {["邮箱登录", "自动创建钱包", "生成支付链接", "接收 USDC"].map(
                (step, i) => (
                  <div key={step}>
                    <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 font-semibold text-sm flex items-center justify-center mx-auto mb-3">
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium text-slate-800">{step}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 text-center mb-10">
            常见问题
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "需要助记词吗？",
                a: "不需要。商户用邮箱登录，系统通过 Circle Developer-Controlled Wallets 自动创建收款钱包。",
              },
              {
                q: "客户如何付款？",
                a: "打开支付链接，连接 MetaMask（Arc Testnet），确认金额与地址后直接转 USDC 到商户钱包。",
              },
              {
                q: "平台会经手资金吗？",
                a: "不会。USDC 从付款人钱包直达商户地址，ArcPay 只提供链接与展示。",
              },
              {
                q: "现在是主网吗？",
                a: "当前为 Arc Testnet 工作原型，仅用于演示与测试，请使用测试 USDC。",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="bg-white rounded-xl border border-slate-200 p-5"
              >
                <p className="font-medium text-slate-900 text-sm">{item.q}</p>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>ArcPay · Working prototype on Arc Testnet</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-600">
              App
            </Link>
            <a
              href="https://testnet.arcscan.app/address/0xde8d06fbc604a4a43b797c5e83cbee1f4b527388"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600"
            >
              Contract
            </a>
            <a
              href="https://docs.arc.network"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600"
            >
              Arc Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}