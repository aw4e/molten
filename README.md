<div align="center">
  <img src="https://raw.githubusercontent.com/aw4e/molten/master/assets/Molten.png" alt="Molten" width="160" />

  # Molten

  **AI-powered MCP DevTools for Mantle Network**

  [![npm](https://img.shields.io/npm/v/@awedev/molten-mcp)](https://www.npmjs.com/package/@awedev/molten-mcp)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![Mantle](https://img.shields.io/badge/Mantle-Sepolia-blue)](https://explorer.sepolia.mantle.xyz/address/0xe09155ea5efb809e7b6a16c63ef554fb8f2b4fda)

  *Mantle Turing Test Hackathon 2026 — Track 05: AI DevTools*
</div>

---

Building on Mantle means juggling five separate tools — a security auditor, a gas profiler, a transaction simulator, a wallet profiler, and a contract source fetcher. Every context switch kills your flow.

**Molten collapses all of it into one MCP server.** Just ask your AI assistant.

## Tools

| Tool | What it does |
|------|-------------|
| `audit_contract` | Security audit — severity-ranked findings (critical → info) with fix recommendations |
| `analyze_gas` | Gas optimization — before/after Solidity snippets with estimated savings |
| `simulate_tx` | Dry-run a transaction against live Mantle state — gas estimate or revert reason |
| `explain_error` | Decode any EVM revert or hex error into plain English with actionable fixes |
| `check_mantle_patterns` | Compliance check for RWA, mETH staking, LayerZero bridge, and general L2 patterns |
| `get_wallet_intel` | Nansen AI wallet profiling — entity labels, smart money, exchange/fund/hacker flags |
| `get_contract_source` | Fetch verified source code and ABI from Mantle Explorer |
| `get_mantle_gas_price` | Real-time gas price in wei and Gwei on mainnet or Sepolia |

## Quick Start

```bash
npx --yes @awedev/molten-mcp
```

Or install globally:

```bash
npm install -g @awedev/molten-mcp
```

## Configuration

### Prerequisites

At minimum you need one AI provider API key. Get one from:

| Provider | Where to get key |
|----------|-----------------|
| MiMo (Xiaomi) | [xiaomimimo.com](https://token-plan-sgp.xiaomimimo.com) |
| Anthropic | [console.anthropic.com](https://console.anthropic.com) |
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google Gemini | [aistudio.google.com](https://aistudio.google.com/apikey) |
| Tencent Hunyuan | [hunyuan.tencent.com](https://hunyuan.tencent.com) |

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "molten": {
      "command": "npx",
      "args": ["--yes", "@awedev/molten-mcp"],
      "env": {
        "AI_PROVIDER": "anthropic",
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add molten -s user \
  -e AI_PROVIDER=anthropic \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -- npx --yes @awedev/molten-mcp
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "molten": {
      "command": "npx",
      "args": ["--yes", "@awedev/molten-mcp"],
      "env": {
        "AI_PROVIDER": "openai",
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

## AI Providers

Set `AI_PROVIDER` in the env to switch providers:

| `AI_PROVIDER` | Key env var | Default model |
|---------------|-------------|---------------|
| `anthropic` (default) | `ANTHROPIC_API_KEY` | claude-sonnet-4-6 |
| `mimo` | `MIMO_API_KEY` | mimo-v2.5-pro |
| `openai` | `OPENAI_API_KEY` | gpt-4o |
| `gemini` | `GEMINI_API_KEY` | gemini-2.5-flash |
| `tencent-hunyuan` | `TENCENT_HUNYUAN_API_KEY` | hunyuan-pro |

Override the model per-provider with `ANTHROPIC_MODEL`, `MIMO_MODEL`, `OPENAI_MODEL`, `GEMINI_MODEL`, or `TENCENT_HUNYUAN_MODEL`.

## Environment Variables

```bash
# Required — pick at least one AI provider
ANTHROPIC_API_KEY=sk-ant-...
MIMO_API_KEY=tp-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
TENCENT_HUNYUAN_API_KEY=...

# Optional — Nansen wallet intelligence
NANSEN_API_KEY=...

# Optional — Mantle Explorer (Blockscout)
MANTLE_EXPLORER_API_KEY=...

# Optional — custom RPC endpoints
MANTLE_RPC_URL=https://rpc.mantle.xyz
MANTLE_SEPOLIA_RPC_URL=https://rpc.sepolia.mantle.xyz
```

## Example Usage

Once connected to your AI assistant:

```
"Audit this contract for vulnerabilities"
→ paste Solidity source — get severity-ranked findings with fix recommendations

"Optimize gas usage in this contract"
→ analyze_gas returns before/after snippets with estimated savings per call

"Who owns 0xabc...? Are they a known exploiter?"
→ get_wallet_intel returns Nansen labels, smart money flags, entity name

"Fetch and audit the contract at 0x1234 on Mantle Sepolia"
→ get_contract_source → audit_contract chained automatically

"Simulate sending 1 MNT to 0xabc from 0xdef"
→ simulate_tx returns gas estimate in MNT or decoded revert reason

"Does this contract follow mETH staking patterns?"
→ check_mantle_patterns with pattern=meth
```

## Mantle-Native Design

System prompts encode Mantle-specific knowledge:

- L1 data fee awareness — calldata size matters on L2
- `block.timestamp` caveats on Mantle L2
- MNT as the native gas token
- mETH staking interface patterns
- LayerZero cross-chain messaging patterns
- RWA tokenization compliance hooks

## On-Chain Contract

**MoltenRegistry** deployed on Mantle Sepolia:

- Address: `0xe09155ea5efb809e7b6a16c63ef554fb8f2b4fda`
- Explorer: [explorer.sepolia.mantle.xyz](https://explorer.sepolia.mantle.xyz/address/0xe09155ea5efb809e7b6a16c63ef554fb8f2b4fda)

## Local Development

```bash
git clone https://github.com/aw4e/molten.git
cd molten
npm install
cp .env.example .env   # fill in at least one AI provider key
npm run dev            # runs via tsx, no build needed
```

```bash
npm run build   # tsc → dist/
npm start
```

## Stack

- **Runtime**: Node.js 18+ · TypeScript strict · ESM
- **MCP**: `@modelcontextprotocol/sdk`
- **Chain**: `viem` — Mantle mainnet + Sepolia clients
- **AI**: Anthropic · MiMo (Xiaomi) · OpenAI · Google Gemini · Tencent Hunyuan
- **Validation**: Zod
- **Intelligence**: Nansen AI API · Mantle Explorer (Blockscout) API

## License

MIT
