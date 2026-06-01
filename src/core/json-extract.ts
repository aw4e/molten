export function extractJson(text: string): string {
  // Extract content from markdown code block, then find JSON within it
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const source = codeBlock?.[1] ?? text;

  // Walk brace depth, string-aware (skip { } inside quoted strings)
  const start = source.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in AI response");

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }

  throw new Error("Malformed JSON in AI response — unmatched braces");
}
