export interface ErrorExplanation {
  raw: string;
  plainEnglish: string;
  possibleCauses: string[];
  suggestedFixes: string[];
}

export interface AiErrorResponse {
  plainEnglish: string;
  possibleCauses: string[];
  suggestedFixes: string[];
}
