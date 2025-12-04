import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { veniceAPI } from "../../client/venice-api.js";
import type { APIKeysResponse, CreateAPIKeyResponse, RateLimitsResponse } from "../../types/api-types.js";

export function registerAdminTools(server: McpServer): void {
  // List API keys tool
  server.tool(
    "venice_list_api_keys",
    "List all API keys on the account (requires admin API key)",
    {},
    async () => {
      const response = await veniceAPI("/api_keys");
      const data = await response.json() as APIKeysResponse;
      if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
      const keys = data.data || [];
      const list = keys.map((k) => {
        const created = k.createdAt || k.created_at || "?";
        const name = k.name || k.description || "Unnamed";
        return `- ${name} (${k.id}) - created: ${created.split("T")[0]}`;
      }).join("\n");
      return { content: [{ type: "text" as const, text: `API Keys (${keys.length}):\n${list}` }] };
    }
  );

  // Create API key tool (FIXED: correct parameters)
  server.tool(
    "venice_create_api_key",
    "Create a new API key",
    { 
      description: z.string().describe("Description for the new API key"),
      apiKeyType: z.enum(["ADMIN", "INFERENCE"]).optional().default("INFERENCE").describe("API key type (ADMIN or INFERENCE)"),
      consumptionLimit: z.object({
        usd: z.number().optional(),
        diem: z.number().optional(),
        vcu: z.number().optional()
      }).optional().describe("Optional consumption limits"),
      expiresAt: z.string().optional().describe("Optional expiration date (ISO 8601 format)")
    },
    async ({ description, apiKeyType, consumptionLimit, expiresAt }) => {
      const body: Record<string, unknown> = { description, apiKeyType };
      if (consumptionLimit) body.consumptionLimit = consumptionLimit;
      if (expiresAt) body.expiresAt = expiresAt;

      const response = await veniceAPI("/api_keys", { method: "POST", body: JSON.stringify(body) });
      const data = await response.json() as CreateAPIKeyResponse;
      if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
      
      const keyData = data.data;
      const secret = keyData?.apiKey || keyData?.key || "N/A";
      return { content: [{ type: "text" as const, text: `Created API key "${keyData?.description}"\nID: ${keyData?.id}\nSecret: ${secret}\n\n⚠️ Save this secret - it won't be shown again!` }] };
    }
  );

  // Retrieve API key tool
  server.tool(
    "venice_retrieve_api_key",
    "Get details for a specific API key",
    { key_id: z.string().describe("The API key ID to retrieve") },
    async ({ key_id }) => {
      const response = await veniceAPI(`/api_keys/${key_id}`);
      const data = await response.json() as { data?: Record<string, unknown>; error?: { message?: string } };
      if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
      return { content: [{ type: "text" as const, text: JSON.stringify(data.data, null, 2) }] };
    }
  );

  // Delete API key tool
  server.tool(
    "venice_delete_api_key",
    "Delete an API key",
    { key_id: z.string().describe("The API key ID to delete") },
    async ({ key_id }) => {
      const response = await veniceAPI(`/api_keys/${key_id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json() as { error?: { message?: string } };
        return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
      }
      return { content: [{ type: "text" as const, text: `✓ Deleted API key: ${key_id}` }] };
    }
  );

  // Get rate limits tool (FIXED: correct endpoint path)
  server.tool(
    "venice_get_rate_limits",
    "Get current rate limits, usage, and account information",
    {},
    async () => {
      const response = await veniceAPI("/api_keys/rate_limits");
      const data = await response.json() as RateLimitsResponse;
      if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
      return { content: [{ type: "text" as const, text: JSON.stringify(data.data, null, 2) }] };
    }
  );

  // Get rate limit logs tool (FIXED: correct endpoint path)
  server.tool(
    "venice_get_rate_limit_logs",
    "Get rate limit usage history logs",
    {},
    async () => {
      const response = await veniceAPI("/api_keys/rate_limits/logs");
      const data = await response.json() as { data?: unknown; error?: { message?: string } };
      if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
      return { content: [{ type: "text" as const, text: JSON.stringify(data.data, null, 2) }] };
    }
  );
}
