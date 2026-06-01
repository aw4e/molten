import { createPublicClient, http, defineChain } from "viem";
import type { PublicClient } from "viem";
import type { Network } from "../types/index.js";

const mantleMainnet = defineChain({
  id: 5000,
  name: "Mantle",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mantle.xyz"] },
  },
  blockExplorers: {
    default: { name: "Mantlescan", url: "https://mantlescan.xyz" },
  },
});

const mantleSepolia = defineChain({
  id: 5003,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia.mantle.xyz"] },
  },
  blockExplorers: {
    default: { name: "Mantlescan Sepolia", url: "https://sepolia.mantlescan.xyz" },
  },
  testnet: true,
});

export function getMantleClient(network: Network = "mainnet"): PublicClient {
  const chain = network === "mainnet" ? mantleMainnet : mantleSepolia;
  const rpcUrl =
    network === "mainnet"
      ? (process.env["MANTLE_RPC_URL"] ?? "https://rpc.mantle.xyz")
      : (process.env["MANTLE_SEPOLIA_RPC_URL"] ?? "https://rpc.sepolia.mantle.xyz");

  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
}
