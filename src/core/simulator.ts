import { getMantleClient } from "./mantle-client.js";
import type { SimulationRequest, SimulationResult } from "../types/index.js";
import type { Network } from "../types/index.js";

export async function simulateTransaction(
  request: SimulationRequest,
  network: Network = "sepolia"
): Promise<SimulationResult> {
  const client = getMantleClient(network);

  try {
    const gasEstimate = await client.estimateGas({
      account: request.from,
      to: request.to,
      data: request.data,
      value: request.value,
    });

    return {
      success: true,
      gasEstimate,
      revertReason: undefined,
      logs: [],
    };
  } catch (err) {
    const revertReason = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      gasEstimate: 0n,
      revertReason,
      logs: [],
    };
  }
}

export async function getGasPrice(network: Network = "mainnet"): Promise<bigint> {
  const client = getMantleClient(network);
  return client.getGasPrice();
}

export async function getBlockNumber(network: Network = "mainnet"): Promise<bigint> {
  const client = getMantleClient(network);
  return client.getBlockNumber();
}
