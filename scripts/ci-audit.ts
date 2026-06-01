#!/usr/bin/env tsx
/**
 * Molten CI Audit — run from GitHub Actions or any CI pipeline.
 *
 * Usage:
 *   tsx scripts/ci-audit.ts <file.sol> [file2.sol ...]
 *   tsx scripts/ci-audit.ts contracts/MyToken.sol
 *
 * Exit codes:
 *   0 — passed (high findings emit GH Actions warnings but do not block)
 *   1 — critical findings found (blocks merge)
 */

import { readFileSync } from "fs";
import { auditContract } from "../src/core/auditor.js";
import { analyzeGas } from "../src/core/gas-analyzer.js";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: tsx scripts/ci-audit.ts <file.sol> [file2.sol ...]");
  process.exit(1);
}

let exitCode = 0;

for (const file of files) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Molten Audit: ${file}`);
  console.log("=".repeat(60));

  let src: string;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    console.error(`  ERROR: Cannot read ${file}`);
    continue;
  }

  const [auditResult, gasResult] = await Promise.all([
    auditContract(src),
    analyzeGas(src),
  ]);

  const criticals = auditResult.findings.filter((f) => f.severity === "critical");
  const highs = auditResult.findings.filter((f) => f.severity === "high");
  const meds = auditResult.findings.filter((f) => f.severity === "medium");

  console.log(`\nSecurity Score : ${auditResult.securityScore}/100`);
  console.log(`Gas Score      : ${auditResult.gasScore}/100`);
  console.log(
    `Findings       : ${criticals.length} critical · ${highs.length} high · ${meds.length} medium`
  );
  console.log(`\nSummary: ${auditResult.summary}`);

  if (criticals.length > 0) {
    console.log("\n[CRITICAL FINDINGS — MERGE BLOCKED]");
    for (const f of criticals) {
      console.log(`  ✗ [CRITICAL] ${f.title}`);
      if (f.description) console.log(`    ${f.description}`);
      if (f.recommendation) console.log(`    Fix: ${f.recommendation}`);
    }
    exitCode = 1;
  }

  if (highs.length > 0) {
    console.log("\n[HIGH FINDINGS — REVIEW REQUIRED]");
    for (const f of highs) {
      // GH Actions warning annotation — visible in PR but does not block merge
      console.log(`::warning::${file}: [HIGH] ${f.title}`);
      console.log(`  ⚠ [HIGH] ${f.title}`);
      if (f.recommendation) console.log(`    Fix: ${f.recommendation}`);
    }
  }

  if (gasResult.optimizations.length > 0) {
    const gasPriceGwei = 0.02;
    const mntSaved = (Number(gasResult.estimatedSavings) * gasPriceGwei) / 1e9;
    console.log(
      `\nGas Savings: ${gasResult.estimatedSavings.toLocaleString()} gas` +
        ` (~${gasResult.savingsPercentage.toFixed(1)}% · ${mntSaved.toFixed(6)} MNT/call at ${gasPriceGwei} gwei)`
    );
    console.log(`Top optimization: ${gasResult.optimizations[0].description}`);
  }
}

console.log(`\n${"=".repeat(60)}`);
if (exitCode === 0) console.log("✓ All contracts passed Molten audit");
else console.log("✗ Critical findings detected — fix before merging");

process.exit(exitCode);
