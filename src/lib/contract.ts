export const PAYMENT_CONTRACT_ADDRESS =
  "0xde8d06fbc604a4a43b797c5e83cbee1f4b527388" as `0x${string}`;

export const PAYMENT_ABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "orderId", type: "bytes32" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "description", type: "string" },
    ],
    name: "createOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "orderId", type: "bytes32" }],
    name: "pay",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "orderId", type: "bytes32" }],
    name: "getOrder",
    outputs: [
      { internalType: "address", name: "merchant", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "bool", name: "paid", type: "bool" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000" as const;

export const USDC_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;