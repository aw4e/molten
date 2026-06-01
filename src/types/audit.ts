import type { Severity } from "./common.js";

export interface AuditFinding {
  severity: Severity;
  title: string;
  description: string;
  line: number | null;
  gasImpact: string | null;
  recommendation: string;
}

export interface AuditResult {
  sourceCode: string;
  findings: AuditFinding[];
  securityScore: number;
  gasScore: number;
  summary: string;
  estimatedSavings: string | null;
}

export interface AiAuditResponse {
  findings: AuditFinding[];
  securityScore: number;
  gasScore: number;
  summary: string;
  estimatedSavings: string | null;
}
