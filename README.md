<div align="center">
  <img src="assets/Molten.png" alt="Molten" width="160" />

  # Molten

  **AI-powered MCP DevTools for Mantle Network**

  [![npm](https://img.shields.io/npm/v/molten-mcp)](https://www.npmjs.com/package/molten-mcp)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![Mantle](https://img.shields.io/badge/Mantle-Sepolia-blue)](https://explorer.sepolia.mantle.xyz/address/0xe09155ea5efb809e7b6a16c63ef554fb8f2b4fda)

  *Mantle Turing Test Hackathon 2026 — Track 05: AI DevTools*
</div>

---

Molten is a [Model Context Protocol](https://modelcontextprotocol.io) server that puts Mantle Network developer tools directly inside Claude Desktop, Cursor, and VS Code. Audit contracts, optimize gas, simulate transactions, and profile wallets — all through natural language in your AI assistant.

## Tools

| Tool | Description |
|------|-------------|
| `audit_contract` | Security audit — severity-ranked findings (critical → info) with fix recommendations |
| `analyze_gas` | Gas optimization — before/after Solidity snippets with estimated savings |
| `simulate_tx` | Dry-run a transaction against live Mantle state; returns gas estimate or revert reason |
| `explain_error` | Decode any EVM revert or hex error into plain English with actionable fixes |
| `check_mantle_patterns` | Compliance check for RWA, mETH staking, LayerZero bridge, and general L2 patterns |
| `get_wallet_intel` | Nansen AI wallet profiling — entity labels, smart money, exchange/fund/hacker flags |
| `get_contract_source` | Fetch verified source code and ABI from Mantle Explorer |
| `get_mantle_gas_price` | Real-time gas price in wei and Gwei on mainnet or Sepolia |

## Quick Start

```bash
npx molten-mcp
```

Or install globally:

```bash
npm install -g molten-mcp
molten-mcp
```

## Configuration

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "molten": {
      "command": "npx",
      "args": ["molten-mcp"],
      "env": {
        "AI_PROVIDER": "anthropic",
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "molten": {
      "command": "npx",
      "args": ["molten-mcp"],
      "env": {
        "AI_PROVIDER": "gemini",
        "GEMINI_API_KEY": "..."
      }
    }
  }
}
```

## AI Providers

Switch providers by setting `AI_PROVIDER` in the env:

| `AI_PROVIDER` | Key env var | Model |
|---------------|-------------|-------|
| `anthropic` (default) | `ANTHROPIC_API_KEY` | claude-sonnet-4-6 |
| `openai` | `OPENAI_API_KEY` | gpt-4o |
| `gemini` | `GEMINI_API_KEY` | gemini-2.5-flash |
| `tencent-hunyuan` | `TENCENT_HUNYUAN_API_KEY` | hunyuan-pro |

## Environment Variables

```bash
# Required — at least one AI provider key
ANTHROPIC_API_KEY=sk-ant-...
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

## Local Development

```bash
git clone <repo>
cd molten
npm install
cp .env.example .env   # fill in at least one AI provider key
npm run dev            # runs via tsx (no build needed)
```

Build for production:

```bash
npm run build   # tsc → dist/
npm start
```

## Example Usage

Once connected to your AI assistant:

```
"Audit this contract for vulnerabilities"
→ paste Solidity source code

"Who owns 0xabc...? Are they a known exploiter?"
→ get_wallet_intel with Nansen labels

"Fetch and audit the contract at 0x1234 on Mantle Sepolia"
→ get_contract_source → audit_contract chained automatically

"Simulate sending 1 MNT to 0xabc from 0xdef"
→ simulate_tx with gas estimate in MNT

"Does this contract follow mETH staking patterns?"
→ check_mantle_patterns with pattern=meth
```

## Mantle-Native Design

System prompts encode Mantle-specific knowledge:

- L1 data fee awareness — calldata size matters on L2
- `block.timestamp` caveats on L2
- MNT as the native gas token
- mETH staking interface patterns
- LayerZero cross-chain messaging patterns
- RWA tokenization compliance hooks

## On-Chain Contract

**MoltenRegistry** deployed on Mantle Sepolia:

- Address: `0xe09155ea5efb809e7b6a16c63ef554fb8f2b4fda`
- Explorer: [sepolia.mantlescan.xyz](https://explorer.sepolia.mantle.xyz/address/0xe09155ea5efb809e7b6a16c63ef554fb8f2b4fda)

## Stack

- **Runtime**: Node.js 18+ · TypeScript strict · ESM
- **MCP**: `@modelcontextprotocol/sdk`
- **Chain**: `viem` — Mantle mainnet + Sepolia clients
- **AI**: Anthropic · OpenAI · Google Gemini · Tencent Hunyuan
- **Validation**: Zod
- **Intelligence**: Nansen AI API · Mantle Explorer (Blockscout) API

## License

MIT
