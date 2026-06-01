import type {
  ContractSource,
  ExplorerApiResult,
  ExplorerContractResult,
  Network,
} from "../types/index.js";

const EXPLORER_URLS: Record<Network, string> = {
  mainnet: "https://explorer.mantle.xyz/api",
  sepolia: "https://explorer.sepolia.mantle.xyz/api",
};

function buildUrl(network: Network, params: Record<string, string>): string {
  const base = EXPLORER_URLS[network];
  const query = new URLSearchParams(params).toString();
  return `${base}?${query}`;
}

function explorerHeaders(): HeadersInit {
  const key = process.env["MANTLE_EXPLORER_API_KEY"];
  return key ? { "x-api-key": key } : {};
}

export async function getContractSource(
  address: string,
  network: Network,
): Promise<ContractSource> {
  const url = buildUrl(network, {
    module: "contract",
    action: "getsourcecode",
    address,
  });

  const res = await fetch(url, {
    signal: AbortSignal.timeout(10_000),
    headers: explorerHeaders(),
  });
  if (!res.ok) throw new Error(`Explorer API ${res.status}: ${res.statusText}`);

  const data = (await res.json()) as ExplorerApiResult;

  if (data.status !== "1" || !Array.isArray(data.result) || data.result.length === 0) {
    return {
      address,
      network,
      isVerified: false,
      contractName: null,
      compilerVersion: null,
      sourceCode: null,
      abi: null,
      constructorArguments: null,
      licenseType: null,
    };
  }

  const r = data.result[0] as ExplorerContractResult;
  const hasSource = r.SourceCode && r.SourceCode !== "" && r.SourceCode !== "0x";

  return {
    address,
    network,
    isVerified: !!hasSource,
    contractName: r.ContractName || null,
    compilerVersion: r.CompilerVersion || null,
    sourceCode: hasSource ? r.SourceCode : null,
    abi: r.ABI && r.ABI !== "Contract source code not verified" ? r.ABI : null,
    constructorArguments: r.ConstructorArguments || null,
    licenseType: r.LicenseType || null,
  };
}

export async function isContractVerified(
  address: string,
  network: Network,
): Promise<boolean> {
  const info = await getContractSource(address, network);
  return info.isVerified;
}
