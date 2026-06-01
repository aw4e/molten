# DoraHacks Submission Checklist — Molten

## How to Submit

Post a **Thread on X** with `#MantleAIHackathon` containing:

| # | Required | Status |
|---|----------|--------|
| 1 | Pitch | ✅ Ready below |
| 2 | Demo video | ⏳ Need to record |
| 3 | GitHub link | ✅ https://github.com/aw4e/molten |
| 4 | Mantle contract address | ✅ `0xe09155ea5efb809e7b6a16c63ef554fb8f2b4fda` (Mantle Sepolia) |

**Deadline:** June 15, 2026  
**Track:** 05 — AI DevTools (Sponsor: Tencent Cloud, Prize: $8,500)  
**Demo Day:** July 2–3, 2026

---

## ✅ Mantle Contract Address

**MoltenRegistry** deployed on Mantle Sepolia:
- Address: `0xe09155ea5efb809e7b6a16c63ef554fb8f2b4fda`
- Tx: `0xb71a5625f91cdbf550f07dae72181bf47e9252763704d128c8f50cd06d219267`
- Explorer: https://explorer.sepolia.mantle.xyz/address/0xe09155ea5efb809e7b6a16c63ef554fb8f2b4fda

---

## X Thread — Copy-Paste Template

> **Tweet 1 (hook):**
> 
> Introducing Molten 🔥 — an AI-powered MCP server that brings contract auditing, gas optimization, and wallet intelligence directly into your IDE.
> 
> Built for @0xMantle Turing Test Hackathon 2026 · Track 05 AI DevTools
> 
> #MantleAIHackathon #Mantle #AIDevTools

---

> **Tweet 2 (problem + solution):**
> 
> The problem: Mantle devs juggle 5 tools just to ship safely:
> - Audit → hire a firm ($5K–$50K)
> - Gas optimization → profile manually
> - Debug reverts → decode hex by hand
> - Wallet research → Nansen + Explorer separately
> - Pre-deploy simulation → write Hardhat scripts
> 
> Molten collapses all of it into one MCP server. Just ask your AI.

---

> **Tweet 3 (8 tools):**
> 
> Molten gives your AI assistant 8 tools:
> 
> 🔍 audit_contract — severity-ranked security findings
> ⛽ analyze_gas — before/after snippets + savings
> 🔁 simulate_tx — dry-run on live Mantle state
> 💡 explain_error — decode any revert in plain English
> 🧪 check_mantle_patterns — RWA / mETH / LayerZero compliance
> 🕵️ get_wallet_intel — Nansen AI wallet profiling
> 📄 get_contract_source — fetch verified source + ABI
> 📊 get_mantle_gas_price — real-time gas in wei + Gwei

---

> **Tweet 4 (tech + sponsors):**
> 
> Built with:
> - MCP protocol → works in Claude Desktop, Cursor, VS Code
> - @Tencent Hunyuan + @MiMo (Xiaomi) integrated as AI providers (+ Anthropic, OpenAI, Gemini)
> - @Nansen_AI wallet intelligence API
> - @MantleBlockchain Explorer verified source API
> - TypeScript strict mode, Zod validation, viem
> 
> GitHub: https://github.com/aw4e/molten
> Contract: `0xe09155ea5efb809e7b6a16c63ef554fb8f2b4fda` (Mantle Sepolia)
> 
> Demo: [VIDEO_LINK — isi setelah upload]

---

## Demo Video Script (2–3 min)

```
0:00 - Open Claude Desktop
0:15 - "Fetch and audit the contract at 0x[DEPLOYED_ADDRESS] on Mantle Sepolia"
       → Show get_contract_source running
       → Show audit_contract findings (Critical/High/Medium)
0:45 - "Optimize the gas in this contract"
       → Show analyze_gas before/after snippets
1:15 - "Who deployed this contract?"
       → Show get_wallet_intel → Nansen labels
1:35 - "Simulate this tx before I send it"
       → Show simulate_tx → gas estimate in MNT
2:00 - Show provider switch: AI_PROVIDER=tencent-hunyuan
       → Same audit, powered by Hunyuan
2:30 - End card: GitHub + npm install command
```

---

## DoraHacks Registration

Also register on DoraHacks (in addition to X thread):
- URL: https://dorahacks.io/hackathon/mantleturingtesthackathon2026
- Select: Track 05 — AI DevTools
- Fill project name, description, GitHub, demo video

---

## Pitch (for DoraHacks description field)

Molten is an MCP (Model Context Protocol) server that delivers AI-powered developer tools for the Mantle Network directly inside Claude Desktop, Cursor, and VS Code.

**The Problem:** Building safely on Mantle requires 5 separate tools — a security auditor, a gas profiler, a transaction simulator, a wallet profiler, and a contract source fetcher. Every context switch kills flow.

**The Solution:** 8 MCP tools that work through natural language in any AI assistant. Ask "audit this contract" and get severity-ranked findings with fix recommendations. Ask "who deployed this?" and get Nansen wallet intelligence. Ask "simulate my tx" and get a gas estimate in MNT against live Mantle state.

**Mantle-Native:** System prompts encode Mantle-specific knowledge — L1 fee awareness, MNT gas token, mETH staking interfaces, LayerZero bridge patterns, block.timestamp caveats.

**Sponsor Integration:** Tencent Hunyuan integrated as a swappable AI provider. Nansen AI API powers wallet intelligence. Mantle Explorer API fetches verified source.

**Install:** `npx @awedev/molten-mcp` — no setup beyond API keys.

Tech: TypeScript · MCP SDK · viem · Zod · Anthropic + OpenAI + Gemini + Tencent Hunyuan · Nansen API · Mantle Explorer API
