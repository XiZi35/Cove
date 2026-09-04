# Cove

**Email in. Payment link out. USDC to your wallet.**

Cove is a merchant payment-link product for USDC.  
Businesses sign in with email, get a receiving wallet automatically, create a shareable payment link, and receive USDC directly to their address—without seed phrases or chain complexity.

> Working prototype · Testnet only · Not production financial software

## Demo

- App: https://cove-pay.vercel.app  
- Login: https://cove-pay.vercel.app/login  

## One-liner

**EN:** Payment links for USDC. Sign in with email, share a link, get paid straight to your wallet.  
**中文：** 邮箱开通钱包，生成支付链接，USDC 直达商户地址。

## Flow

1. Merchant signs in with email  
2. System creates a receiving wallet (Circle Developer-Controlled)  
3. Merchant sets amount + description → generates payment link  
4. Customer opens link → MetaMask → direct USDC transfer  
5. Funds arrive at merchant address; receipt available on success page  

## Why this shape

- **Merchants** should not need seed phrases, gas tokens, or chain IDs  
- **Settlement** is on-chain USDC to the merchant address (Cove never holds funds)  
- **Links** match the mental model of traditional payment links  

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js, TypeScript, Tailwind |
| Wallets | Circle Developer-Controlled Wallets |
| Payments | Direct USDC `transfer` to merchant address |
| Orders | Upstash Redis (cross-device) |
| Deploy | Vercel |

## Local development

```bash
npm install
# .env.local: CIRCLE_API_KEY, CIRCLE_ENTITY_SECRET,
# UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
npx next dev --webpack