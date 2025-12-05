import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { veniceAPI } from "../../client/venice-api.js";
import type { ChatCompletionResponse, ImageGenerationResponse, ImageUpscaleResponse, EmbeddingsResponse } from "../../types/api-types.js";

function getImageOutputDir(): string {
  const dir = join(homedir(), "venice-images");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function registerInferenceTools(server: McpServer): void {
  // Chat tool
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

      const data = await response.json() as ChatCompletionResponse;
      if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
      return { content: [{ type: "text" as const, text: data.choices?.[0]?.message?.content || "No response" }] };
    }
  );

  // Image generation tool
  server.tool(
    "venice_generate_image",
    "Generate an image from a text prompt using Venice AI",
    {
      prompt: z.string().describe("Text description of the image to generate"),
      model: z.string().optional().default("fluently-xl").describe("Image model (e.g., fluently-xl, flux-dev)"),
      size: z.string().optional().default("1024x1024").describe("Image size (e.g., 512x512, 1024x1024, 1792x1024)"),
      
      style_preset: z.string().optional().describe("Style preset name"),
      negative_prompt: z.string().optional().describe("What to avoid in the image"),
    },
    async ({ prompt, model, size, style_preset, negative_prompt }) => {
      const body: Record<string, unknown> = { model, prompt, size, n: 1, response_format: "b64_json" };
      if (style_preset) body.style_preset = style_preset;
      if (negative_prompt) body.negative_prompt = negative_prompt;

      const response = await veniceAPI("/images/generations", { method: "POST", body: JSON.stringify(body) });
      const data = await response.json() as ImageGenerationResponse;
      if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };

      const img = data.data?.[0];
      if (img?.b64_json) {
        const outputDir = getImageOutputDir();
        const filename = `venice-${Date.now()}.png`;
        const filepath = join(outputDir, filename);
        writeFileSync(filepath, Buffer.from(img.b64_json, "base64"));
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ success: true, path: filepath }),
          }],
        };
      }
      if (img?.url) return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, url: img.url }) }] };
      return { content: [{ type: "text" as const, text: JSON.stringify({ success: false, error: "No image data returned" }) }] };
    }
  );

  // Image upscale tool
  server.tool(
    "venice_upscale_image",
    "Upscale an image using Venice AI",
    {
      image: z.string().describe("Base64-encoded image data or URL"),
      scale: z.number().optional().default(2).describe("Upscale factor (2, 4, etc.)"),
    },
    async ({ image, scale }) => {
      const response = await veniceAPI("/images/upscale", { method: "POST", body: JSON.stringify({ image, scale }) });
      const data = await response.json() as ImageUpscaleResponse;
      if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
      return { content: [{ type: "text" as const, text: data.data?.url ? `Upscaled: ${data.data.url}` : "Image upscaled" }] };
    }
  );

  // Text-to-speech tool
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

  // Embeddings tool
  server.tool(
    "venice_create_embeddings",
    "Generate text embeddings for semantic search and RAG",
    {
      input: z.union([z.string(), z.array(z.string())]).describe("Text or array of texts to embed"),
      model: z.string().optional().default("text-embedding-ada-002").describe("Embedding model"),
    },
    async ({ input, model }) => {
      const response = await veniceAPI("/embeddings", { method: "POST", body: JSON.stringify({ input, model }) });
      const data = await response.json() as EmbeddingsResponse;
      if (!response.ok) return { content: [{ type: "text" as const, text: `Error: ${data.error?.message || response.statusText}` }] };
      const embeddings = data.data || [];
      return { content: [{ type: "text" as const, text: `Generated ${embeddings.length} embedding(s), dimensions: ${embeddings[0]?.embedding?.length || 0}` }] };
    }
  );
}
