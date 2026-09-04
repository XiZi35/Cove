# Cove

**Email in. Payment link out. USDC to your wallet.**

Cove is a merchant payment-link product for USDC.  
Businesses sign in with email, get a receiving wallet automatically, create a shareable payment link, and receive USDC directly to their address.

> Working prototype · Testnet only · Not production financial software

## Demo

- App: https://arc-pay-blue.vercel.app  
- Login: https://arc-pay-blue.vercel.app/login  

## Flow

1. Merchant signs in with email  
2. System creates a receiving wallet  
3. Merchant sets amount + description → generates payment link  
4. Customer opens link → MetaMask → direct USDC transfer  
5. Funds arrive at merchant address; receipt on success page  

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js, TypeScript, Tailwind |
| Wallets | Circle Developer-Controlled Wallets |
| Payments | Direct USDC `transfer` to merchant address |
| Orders | Upstash Redis |
| Deploy | Vercel |

## Status

- [x] Email login + auto wallet  
- [x] Dashboard (balance, orders, copy link)  
- [x] Cross-device payment links  
- [x] Direct USDC pay + success receipt  
- [x] ZH/EN + Cove branding  
- [ ] Mainnet / production auth  

## Disclaimer

This is a **testnet prototype** for demos and ecosystem feedback.  
Do not use with mainnet funds or as a regulated payment service.