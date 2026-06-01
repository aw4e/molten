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

Building on Mantle means juggling multiple tools — a security auditor, gas profiler, transaction simulator, wallet profiler, contract source fetcher, and test generator. Every context switch kills flow.

**Molten collapses all of it into one MCP server.** Ask your AI assistant in plain English.

## Tools (12)

### Security & Audit
| Tool | What it does |
|------|-------------|
| `audit_contract` | Security audit — severity-ranked findings (critical → info) with fix recommendations |
| `compare_contracts` | Regression check — detect new vulnerabilities and gas changes between two contract versions |
| `generate_test_cases` | Auto-generate Foundry PoC exploit tests from audit findings |

### Gas & Deployment
| Tool | What it does |
|------|-------------|
| `analyze_gas` | Gas optimization — before/after Solidity snippets, estimated savings in gas + MNT cost |
| `estimate_deployment_cost` | Estimate MNT deploy cost using live Mantle gas price |
| `get_mantle_gas_price` | Real-time gas price on mainnet or Sepolia in wei, Gwei, and MNT/MGas |

### On-Chain
| Tool | What it does |
|------|-------------|
| `simulate_tx` | Dry-run a transaction against live Mantle state — gas estimate or decoded revert reason |
| `decode_calldata` | Decode raw hex calldata to human-readable function name and parameters |
| `get_contract_source` | Fetch verified source code and ABI from Mantle Explorer |

### Intelligence & Compliance
| Tool | What it does |
|------|-------------|
| `explain_error` | Decode any EVM revert or hex error into plain English with actionable fixes |
| `check_mantle_patterns` | Compliance check for 8 Mantle-specific patterns (see below) |
| `get_wallet_intel` | Nansen AI wallet profiling — entity labels, smart money, exchange/fund/hacker flags |

### Supported Patterns (`check_mantle_patterns`)

| Pattern | Description |
|---------|-------------|
| `rwa` | Real World Asset tokenization — access control, pausability, USDY/mETH integration |
| `meth` | mETH staking integration — correct interface, unstaking delays, slashing handling |
| `layerzero` | LayerZero cross-chain messaging — endpoint usage, gas config, retry logic |
| `general` | General Mantle L2 best practices — L1 fee awareness, MNT gas token, block.timestamp |
| `agni` | Agni Finance DEX (Uniswap V3 fork) — pool interface, tick math, callback reentrancy |
| `merchant_moe` | Merchant Moe DEX (LB protocol) — LBPair bin logic, flash loan callbacks |
| `fbtc` | FBTC wrapped Bitcoin — mint/burn/bridge interface, fee handling, custodian confirmations |
| `lendle` | Lendle lending (Aave V2 fork) — aToken interfaces, health factor, liquidation logic |

## Quick Start

```bash
npm install -g @awedev/molten-mcp
```

Or use directly with npx (Claude Desktop / Cursor):

```bash
npx --yes @awedev/molten-mcp
```

## Configuration

### Prerequisites

At minimum you need one AI provider API key:

| Provider | Env var | Where to get |
|----------|---------|-------------|
| Anthropic (default) | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| MiMo (Xiaomi) | `MIMO_API_KEY` | [xiaomimimo.com](https://token-plan-sgp.xiaomimimo.com) |
| OpenAI | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) |
| Google Gemini | `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/apikey) |
| Tencent Hunyuan | `TENCENT_HUNYUAN_API_KEY` | [hunyuan.tencent.com](https://hunyuan.tencent.com) |

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

Set `AI_PROVIDER` in env to switch providers:

| `AI_PROVIDER` | Key env var | Default model |
|---------------|-------------|---------------|
| `anthropic` (default) | `ANTHROPIC_API_KEY` | claude-sonnet-4-6 |
| `mimo` | `MIMO_API_KEY` | mimo-v2.5-pro |
| `openai` | `OPENAI_API_KEY` | gpt-4o |
| `gemini` | `GEMINI_API_KEY` | gemini-2.5-flash |
| `tencent-hunyuan` | `TENCENT_HUNYUAN_API_KEY` | hunyuan-pro |

Override model per-provider with `ANTHROPIC_MODEL`, `MIMO_MODEL`, `OPENAI_MODEL`, `GEMINI_MODEL`, or `TENCENT_HUNYUAN_MODEL`.

## Environment Variables

```bash
# Required — pick at least one AI provider
ANTHROPIC_API_KEY=sk-ant-...
MIMO_API_KEY=tp-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
TENCENT_HUNYUAN_API_KEY=...

# Optional — Nansen wallet intelligence (required for get_wallet_intel)
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
→ audit_contract returns severity-ranked findings with fix recommendations

"Compare v1 and v2 of my contract — did I introduce any new bugs?"
→ compare_contracts returns regressions, improvements, and gas delta

"Generate Foundry tests for the vulnerabilities you found"
→ generate_test_cases produces a complete .t.sol file with PoC exploits

"Optimize gas usage in this contract"
→ analyze_gas returns before/after snippets + MNT cost savings per call

"How much will it cost to deploy this contract on Mantle?"
→ estimate_deployment_cost returns MNT cost using live gas price

"Decode this calldata: 0xa9059cbb..."
→ decode_calldata returns function name and decoded parameters

"Fetch and audit the contract at 0x1234 on Mantle Sepolia"
→ get_contract_source → audit_contract chained automatically

"Simulate sending 1 MNT to 0xabc from 0xdef"
→ simulate_tx returns gas estimate in MNT or decoded revert reason

"Who owns 0xabc...? Are they a known exploiter?"
→ get_wallet_intel returns Nansen labels, smart money flags, entity name

"Does this contract follow Agni Finance patterns?"
→ check_mantle_patterns with pattern=agni
```

## CI/CD Integration

Molten includes a GitHub Actions workflow that auto-audits changed Solidity files on every PR:

```yaml
# .github/workflows/molten-audit.yml is included in this repo
# Add your AI provider key as a GitHub secret:
# Settings → Secrets → ANTHROPIC_API_KEY
```

Run the audit script directly:

```bash
npx tsx scripts/ci-audit.ts contracts/MyToken.sol
# Exit 0 = passed, Exit 1 = critical findings (blocks merge)
# High findings emit GitHub Actions warnings but do not block
```

## Mantle-Native Design

System prompts encode Mantle-specific knowledge:

- L1 data fee awareness — calldata size matters on L2
- `block.timestamp` caveats on Mantle L2
- MNT as the native gas token
- mETH staking interface patterns
- LayerZero cross-chain messaging patterns
- RWA tokenization compliance hooks
- Agni Finance, Merchant Moe, FBTC, Lendle integration patterns

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
npm run build   # tsc → esbuild → dist/server.js
npm start
```

## Stack

- **Runtime**: Node.js 18+ · TypeScript strict · ESM
- **MCP**: `@modelcontextprotocol/sdk`
- **Chain**: `viem` — Mantle mainnet + Sepolia clients
- **AI**: Anthropic · MiMo (Xiaomi) · OpenAI · Google Gemini · Tencent Hunyuan
- **Validation**: Zod
- **Intelligence**: Nansen AI API · Mantle Explorer (Blockscout) API
- **Build**: esbuild (single-file bundle)

## License

MIT
