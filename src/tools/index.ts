import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAuditTool } from "./audit.js";
import { registerGasTool } from "./gas.js";
import { registerSimulateTool } from "./simulate.js";
import { registerExplainTool } from "./explain.js";
import { registerPatternsTool } from "./patterns.js";
import { registerNansenTool } from "./nansen.js";
import { registerExplorerTool } from "./explorer.js";
import { registerCompareTool } from "./compare.js";
import { registerGenerateTestsTool } from "./generate-tests.js";
import { registerDecodeCalldataTool } from "./decode-calldata.js";
import { registerEstimateDeployTool } from "./estimate-deploy.js";

export function registerAllTools(server: McpServer): void {
  registerAuditTool(server);
  registerGasTool(server);
  registerSimulateTool(server);
  registerExplainTool(server);
  registerPatternsTool(server);
  registerNansenTool(server);
  registerExplorerTool(server);
  registerCompareTool(server);
  registerGenerateTestsTool(server);
  registerDecodeCalldataTool(server);
  registerEstimateDeployTool(server);
}
