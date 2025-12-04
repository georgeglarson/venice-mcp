#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import "dotenv/config";

const API_KEY = process.env.VENICE_API_KEY;
const BASE_URL = "https://api.venice.ai/api/v1";

if (!API_KEY) {
  console.error("Error: VENICE_API_KEY environment variable is required");
  process.exit(1);
}

const server = new McpServer({
  name: "venice-mcp-server",
  version: "1.0.0",
});

async function veniceAPI(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  return fetch(url, { ...options, headers });
}

// ============ INFERENCE TOOLS ============

server.tool(
  "venice_chat",
  "Send a message to Venice AI and get a response from an LLM",
  {
    model: z.string().optional().default("llama-3.3-70b").describe("Model ID (e.g., llama-3.3-70b, deepseek-r1-llama-70b)"),
    message: z.string().describe("The user message to send"),
    system_prompt: z.string().optional().describe("Optional system prompt"),
    temperature: z.number().optional().default(0.7).describe("Sampling temperature (0-2)"),
    max_tokens: z.number().optional().default(2048).describe("Maximum tokens to generate"),
  },
  async ({ model, message, system_prompt, temperature, max_tokens }) => {
    const messages: Array<{role: string; content: string}> = [];
    if (system_prompt) messages.push({ role: "system", content: system_prompt });
    messages.push({ role: "user", content: message });

    const response = await veniceAPI("/chat/completions", {
      method: "POST",
      body: JSON.stringify({ model, messages, temperature, max_tokens }),
    });

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
    if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
    return { content: [{ type: "text" as const, text: data.choices?.[0]?.message?.content || "No response" }] };
  }
);

server.tool(
  "venice_generate_image",
  "Generate an image from a text prompt using Venice AI",
  {
    prompt: z.string().describe("Text description of the image to generate"),
    model: z.string().optional().default("fluently-xl").describe("Image model (e.g., fluently-xl, flux-dev)"),
    width: z.number().optional().default(1024).describe("Image width in pixels"),
    height: z.number().optional().default(1024).describe("Image height in pixels"),
    style_preset: z.string().optional().describe("Style preset name"),
    negative_prompt: z.string().optional().describe("What to avoid in the image"),
  },
  async ({ prompt, model, width, height, style_preset, negative_prompt }) => {
    const body: Record<string, unknown> = { model, prompt, width, height, n: 1 };
    if (style_preset) body.style_preset = style_preset;
    if (negative_prompt) body.negative_prompt = negative_prompt;

    const response = await veniceAPI("/images/generations", { method: "POST", body: JSON.stringify(body) });
    const data = await response.json() as { data?: Array<{ url?: string; b64_json?: string }>; error?: { message?: string } };
    if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };

    const img = data.data?.[0];
    if (img?.url) return { content: [{ type: "text" as const, text: `Image generated: ${img.url}` }] };
    if (img?.b64_json) return { content: [{ type: "text" as const, text: `Image (base64, ${img.b64_json.length} chars)` }] };
    return { content: [{ type: "text" as const, text: "Image generated" }] };
  }
);

server.tool(
  "venice_upscale_image",
  "Upscale an image using Venice AI",
  {
    image: z.string().describe("Base64-encoded image data or URL"),
    scale: z.number().optional().default(2).describe("Upscale factor (2, 4, etc.)"),
  },
  async ({ image, scale }) => {
    const response = await veniceAPI("/images/upscale", { method: "POST", body: JSON.stringify({ image, scale }) });
    const data = await response.json() as { data?: { url?: string }; error?: { message?: string } };
    if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
    return { content: [{ type: "text" as const, text: data.data?.url ? `Upscaled: ${data.data.url}` : "Image upscaled" }] };
  }
);

server.tool(
  "venice_text_to_speech",
  "Convert text to speech audio using Venice AI",
  {
    text: z.string().describe("Text to convert to speech"),
    model: z.string().optional().default("tts-kokoro").describe("TTS model"),
    voice: z.string().optional().default("af_sky").describe("Voice ID (e.g., af_sky, af_bella, am_adam)"),
  },
  async ({ text, model, voice }) => {
    const response = await veniceAPI("/audio/speech", { method: "POST", body: JSON.stringify({ model, input: text, voice }) });
    if (!response.ok) {
      const data = await response.json() as { error?: { message?: string } };
      return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return { content: [{ type: "text" as const, text: `Audio generated (${Math.round(base64.length / 1024)}KB MP3): data:audio/mp3;base64,${base64.substring(0, 50)}...` }] };
  }
);

server.tool(
  "venice_create_embeddings",
  "Generate text embeddings for semantic search and RAG",
  {
    input: z.union([z.string(), z.array(z.string())]).describe("Text or array of texts to embed"),
    model: z.string().optional().default("text-embedding-ada-002").describe("Embedding model"),
  },
  async ({ input, model }) => {
    const response = await veniceAPI("/embeddings", { method: "POST", body: JSON.stringify({ input, model }) });
    const data = await response.json() as { data?: Array<{ embedding?: number[] }>; error?: { message?: string } };
    if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
    const embeddings = data.data || [];
    return { content: [{ type: "text" as const, text: `Generated ${embeddings.length} embedding(s), dimensions: ${embeddings[0]?.embedding?.length || 0}` }] };
  }
);

// ============ DISCOVERY TOOLS ============

server.tool(
  "venice_list_models",
  "List available Venice AI models (text, image, code, embedding)",
  { type: z.enum(["text", "image", "code", "embedding", "all"]).optional().default("all").describe("Filter by model type") },
  async ({ type }) => {
    const response = await veniceAPI("/models");
    const data = await response.json() as { data?: Array<{ id?: string; type?: string; object?: string }>; error?: { message?: string } };
    if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
    let models = data.data || [];
    if (type !== "all") models = models.filter((m) => m.type === type || m.object?.includes(type));
    const list = models.map((m) => `- ${m.id} (${m.type || m.object || "unknown"})`).join("\n");
    return { content: [{ type: "text" as const, text: `Available models (${models.length}):\n${list}` }] };
  }
);

server.tool(
  "venice_list_characters",
  "List available Venice AI character personas for roleplay",
  {},
  async () => {
    const response = await veniceAPI("/characters");
    const data = await response.json() as { data?: Array<{ id?: string; name?: string; description?: string }>; error?: { message?: string } };
    if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
    const chars = data.data || [];
    const list = chars.map((c) => `- ${c.name} (${c.id}): ${c.description || ""}`).join("\n");
    return { content: [{ type: "text" as const, text: `Available characters (${chars.length}):\n${list}` }] };
  }
);

server.tool(
  "venice_list_image_styles",
  "List available image generation style presets",
  {},
  async () => {
    const response = await veniceAPI("/images/styles");
    const data = await response.json() as { data?: Array<{ id?: string; name?: string }>; error?: { message?: string } };
    if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
    const styles = data.data || [];
    const list = styles.map((s) => `- ${s.name || s.id}`).join("\n");
    return { content: [{ type: "text" as const, text: `Available styles (${styles.length}):\n${list}` }] };
  }
);

// ============ ADMIN TOOLS ============

server.tool(
  "venice_list_api_keys",
  "List all API keys on the account (requires admin API key)",
  {},
  async () => {
    const response = await veniceAPI("/api_keys");
    const data = await response.json() as { data?: Array<{ id?: string; name?: string; created_at?: string; last_used_at?: string }>; error?: { message?: string } };
    if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
    const keys = data.data || [];
    const list = keys.map((k) => `- ${k.name || "Unnamed"} (${k.id}) - created: ${k.created_at?.split("T")[0] || "?"}`).join("\n");
    return { content: [{ type: "text" as const, text: `API Keys (${keys.length}):\n${list}` }] };
  }
);

server.tool(
  "venice_create_api_key",
  "Create a new API key",
  { name: z.string().describe("Name for the new API key") },
  async ({ name }) => {
    const response = await veniceAPI("/api_keys", { method: "POST", body: JSON.stringify({ name }) });
    const data = await response.json() as { data?: { id?: string; key?: string; name?: string }; error?: { message?: string } };
    if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
    return { content: [{ type: "text" as const, text: `Created API key "${data.data?.name}"\nID: ${data.data?.id}\nSecret: ${data.data?.key}\n\n⚠️ Save this secret - it won't be shown again!` }] };
  }
);

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

server.tool(
  "venice_get_rate_limits",
  "Get current rate limits, usage, and account information",
  {},
  async () => {
    const response = await veniceAPI("/rate_limits");
    const data = await response.json() as { data?: Record<string, unknown>; error?: { message?: string } };
    if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
    return { content: [{ type: "text" as const, text: JSON.stringify(data.data, null, 2) }] };
  }
);

server.tool(
  "venice_get_rate_limit_logs",
  "Get rate limit usage history logs",
  {},
  async () => {
    const response = await veniceAPI("/rate_limits/logs");
    const data = await response.json() as { data?: unknown; error?: { message?: string } };
    if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
    return { content: [{ type: "text" as const, text: JSON.stringify(data.data, null, 2) }] };
  }
);

// ============ START SERVER ============

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Venice MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
