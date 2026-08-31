# ArcPay

**Email in. Payment link out. USDC settled on Arc.**

ArcPay is a merchant payment-link product on **Arc Testnet**.  
Businesses sign in with email, get a Circle Developer-Controlled wallet automatically, create a shareable payment link, and receive USDC directly to their address.

> Working prototype · Testnet only · Not production financial software

## Demo

- App: https://arc-pay-blue.vercel.app  
- Login: https://arc-pay-blue.vercel.app/login  
- Contract (legacy PaymentReceiver): `0xde8d06fbc604a4a43b797c5e83cbee1f4b527388`

## Flow

1. Merchant signs in with email  
2. System creates an Arc Testnet wallet (Circle Developer-Controlled)  
3. Merchant sets amount + description → generates payment link  
4. Customer opens link → MetaMask → direct USDC transfer  
5. Funds arrive at merchant address; receipt available on success page  

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, Tailwind |
| Wallets | Circle Developer-Controlled Wallets |
| Chain | Arc Testnet (USDC gas + settlement) |
| Payments | Direct USDC `transfer` to merchant address |
| Deploy | Vercel |

## Why Arc

- USDC as gas and settlement asset  
- Fast finality  
- Native digital-dollar UX for business payments  

## Local development

```bash
npm install
# configure .env.local with CIRCLE_API_KEY, CIRCLE_ENTITY_SECRET
npx next dev --webpack

Status

 Email login + auto wallet
 Dashboard (balance, orders, copy link)
 Cross-device payment links (URL-encoded payload)
 Direct USDC pay + success receipt
 Landing page + FAQ
 Persistent order DB
 Mainnet / production auth

Disclaimer
This is a testnet prototype for demos and ecosystem feedback.

Do not use with mainnet funds or as a regulated payment service.