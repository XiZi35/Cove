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
          <Link
            href="/login"
            className="text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            登录
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 py-20 text-center">
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
              className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm shadow-sm shadow-teal-700/20"
            >
              立即开始
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
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid sm:grid-cols-3 gap-6">
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
        </section>

        {/* How it works */}
        <section className="bg-white border-y border-slate-200 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-semibold text-slate-900 text-center mb-10">
              如何使用
            </h2>
            <div className="grid sm:grid-cols-4 gap-6 text-center">
              {[
                "邮箱登录",
                "自动创建钱包",
                "生成支付链接",
                "接收 USDC",
              ].map((step, i) => (
                <div key={step}>
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 font-semibold text-sm flex items-center justify-center mx-auto mb-3">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium text-slate-800">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 text-center mb-10">
            常见问题
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "需要助记词吗？",
                a: "不需要。商户使用邮箱登录，系统通过 Circle Developer-Controlled Wallets 自动创建收款钱包。",
              },
              {
                q: "客户如何付款？",
                a: "打开支付链接后，可使用 MetaMask 在 Arc Testnet 上支付 USDC，支持合约支付或直接转账到商户地址。",
              },
              {
                q: "目前是主网吗？",
                a: "当前为 Arc Testnet 工作原型，用于演示与测试，不涉及真实资金。",
              },
              {
                q: "Gas 用什么付？",
                a: "Arc 使用 USDC 作为 Gas 与结算资产。",
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

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>ArcPay · Working prototype on Arc Testnet</p>
          <div className="flex items-center gap-4">
            <a
              href="https://arc-pay-blue.vercel.app/login"
              className="hover:text-slate-600"
            >
              App
            </a>
            <a
              href="https://testnet.arcscan.app/address/0xde8d06fbc604a4a43b797c5e83cbee1f4b527388"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600"
            >
              Contract
            </a>
            <a
              href="https://docs.arc.io"
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