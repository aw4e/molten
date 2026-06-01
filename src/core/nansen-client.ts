import type { NansenApiAddress, WalletIntelligence } from "../types/index.js";

const NANSEN_BASE = "https://api.nansen.ai";

function getNansenKey(): string {
  const key = process.env["NANSEN_API_KEY"];
  if (!key) throw new Error("NANSEN_API_KEY not set");
  return key;
}

export async function getWalletIntelligence(address: string): Promise<WalletIntelligence> {
  const apiKey = getNansenKey();

  const res = await fetch(`${NANSEN_BASE}/v1/address/${address.toLowerCase()}`, {
    signal: AbortSignal.timeout(10_000),
    headers: {
      "apiKey": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Nansen API ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as NansenApiAddress;

  const labels: { label: string; category: string }[] = data.labels ?? [];
  const categories = new Set(labels.map((l) => l.category?.toLowerCase() ?? ""));

  return {
    address,
    entityName: data.entity ?? null,
    labels,
    isSmartMoney: data.smartMoney ?? false,
    isExchange: categories.has("exchange"),
    isFund: categories.has("fund"),
    isHacker: categories.has("hacker") || categories.has("exploit"),
    transactionCount: data.txCount ?? null,
  };
}

export async function getBatchWalletLabels(
  addresses: string[],
): Promise<Map<string, string | null>> {
  const apiKey = getNansenKey();

  const res = await fetch(`${NANSEN_BASE}/v1/address/labels/batch`, {
    method: "POST",
    signal: AbortSignal.timeout(10_000),
    headers: {
      "apiKey": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ addresses: addresses.map((a) => a.toLowerCase()) }),
  });

  if (!res.ok) {
    throw new Error(`Nansen batch API ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as Record<string, { entity?: string }>;
  const result = new Map<string, string | null>();
  for (const [addr, info] of Object.entries(data)) {
    result.set(addr, info.entity ?? null);
  }
  return result;
}
