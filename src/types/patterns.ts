import type { MantlePatternType, PatternIssueSeverity } from "./common.js";

export interface PatternIssue {
  severity: PatternIssueSeverity;
  description: string;
  line: number | null;
}

export interface PatternCheckResult {
  pattern: MantlePatternType;
  compliant: boolean;
  issues: PatternIssue[];
  recommendations: string[];
}

export interface AiPatternResponse {
  pattern: MantlePatternType;
  compliant: boolean;
  issues: PatternIssue[];
  recommendations: string[];
}
