import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcPay - 让加密支付像传统支付一样简单",
  description: "面向创业者与企业的商业钱包，邮箱登录，自动生成钱包，轻松接收 USDC。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}