import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { veniceAPI } from "../../client/venice-api.js";
import type { ModelsResponse, CharactersResponse } from "../../types/api-types.js";

export function registerDiscoveryTools(server: McpServer): void {
  // List models tool
  server.tool(
    "venice_list_models",
    "List available Venice AI models (text, image, code, embedding)",
    { type: z.enum(["text", "image", "code", "embedding", "all"]).optional().default("all").describe("Filter by model type") },
    async ({ type }) => {
      const response = await veniceAPI("/models");
      const data = await response.json() as ModelsResponse;
      if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
      let models = data.data || [];
      if (type !== "all") models = models.filter((m) => m.type === type || m.object?.includes(type));
      const list = models.map((m) => `- ${m.id} (${m.type || m.object || "unknown"})`).join("\n");
      return { content: [{ type: "text" as const, text: `Available models (${models.length}):\n${list}` }] };
    }
  );

  // List characters tool (with truncation to prevent timeout)
  server.tool(
    "venice_list_characters",
    "List available Venice AI character personas for roleplay",
    { 
      limit: z.number().optional().default(20).describe("Maximum number of characters to return (default: 20)")
    },
    async ({ limit }) => {
      const response = await veniceAPI("/characters");
      const data = await response.json() as CharactersResponse;
      if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
      const chars = (data.data || []).slice(0, limit);
      const list = chars.map((c) => {
        const desc = c.description ? c.description.substring(0, 100) + (c.description.length > 100 ? "..." : "") : "";
        return `- ${c.name} (${c.slug}): ${desc}`;
      }).join("\n");
      return { content: [{ type: "text" as const, text: `Available characters (showing ${chars.length}):\n${list}\n\nNote: Use the slug to interact with a specific character.` }] };
    }
  );
}
