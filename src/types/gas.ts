import type { OptimizationType } from "./common.js";

export interface GasOptimization {
  type: OptimizationType;
  description: string;
  estimatedSaving: bigint;
  codeSnippet: string | undefined;
  fixedSnippet: string | undefined;
}

export interface GasAnalysisResult {
  optimizations: GasOptimization[];
  estimatedSavings: bigint;
  savingsPercentage: number;
  summary: string;
}

export interface RawGasOptimization {
  type: OptimizationType;
  description: string;
  estimatedSaving: number;
  codeSnippet: string | null;
  fixedSnippet: string | null;
}

export interface RawGasResponse {
  optimizations: RawGasOptimization[];
  totalEstimatedSaving: number;
  savingsPercentage: number;
  summary: string;
}
