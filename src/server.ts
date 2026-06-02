#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.js";

const server = new McpServer({
  name: "molten",
  version: "0.3.5",
});

registerAllTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);

process.stderr.write("Molten MCP server running on stdio\n");
