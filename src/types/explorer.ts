import type { Network } from "./common.js";

export interface ContractSource {
  address: string;
  network: Network;
  isVerified: boolean;
  contractName: string | null;
  compilerVersion: string | null;
  sourceCode: string | null;
  abi: string | null;
  constructorArguments: string | null;
  licenseType: string | null;
}

export interface ExplorerApiResult {
  status: string;
  message: string;
  result: ExplorerContractResult[] | string;
}

export interface ExplorerContractResult {
  SourceCode: string;
  ABI: string;
  ContractName: string;
  CompilerVersion: string;
  ConstructorArguments: string;
  LicenseType: string;
}
