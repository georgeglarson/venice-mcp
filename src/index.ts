#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import "dotenv/config";

import { registerInferenceTools } from "./tools/inference/index.js";
import { registerDiscoveryTools } from "./tools/discovery/index.js";
import { registerAdminTools } from "./tools/admin/index.js";

const server = new McpServer({
  name: "venice-mcp-server",
  version: "1.1.0",
});

// Register all tool categories
registerInferenceTools(server);
registerDiscoveryTools(server);
registerAdminTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Venice MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
