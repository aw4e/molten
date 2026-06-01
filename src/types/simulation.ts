export interface SimulationRequest {
  from: `0x${string}`;
  to: `0x${string}`;
  data: `0x${string}` | undefined;
  value: bigint | undefined;
}

export interface SimulationLog {
  address: `0x${string}`;
  topics: readonly `0x${string}`[];
  data: `0x${string}`;
}

export interface SimulationResult {
  success: boolean;
  gasEstimate: bigint;
  revertReason: string | undefined;
  logs: SimulationLog[];
}
