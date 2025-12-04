# Venice MCP Server

[![npm version](https://badge.fury.io/js/venice-mcp.svg)](https://www.npmjs.com/package/venice-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-1.12.0-blue)](https://modelcontextprotocol.io)

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for [Venice AI](https://venice.ai). Gives AI assistants like Claude access to Venice's text generation, image creation, text-to-speech, embeddings, and account management APIs.

## What It Does

This MCP server lets Claude (or any MCP-compatible assistant) use Venice AI's features directly:

- **Chat** with Llama, DeepSeek, Qwen, and other open models
- **Generate images** using Stable Diffusion, FLUX, and more
- **Create speech** from text with natural-sounding voices
- **Generate embeddings** for search and RAG applications
- **Manage API keys** and monitor rate limits

## Quick Start

### 1. Get a Venice API Key

Sign up at [venice.ai](https://venice.ai) and create an API key in [Settings → API](https://venice.ai/settings/api).

### 2. Install

```bash
npm install -g venice-mcp
```

### 3. Configure Claude Desktop

Add to your config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "venice": {
      "command": "npx",
      "args": ["-y", "venice-mcp"],
      "env": {
        "VENICE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Restart Claude Desktop. You'll see Venice tools available in the 🔧 menu.

## Available Tools

### Generation

| Tool | Description |
|------|-------------|
| `venice_chat` | Chat with Venice AI language models |
| `venice_generate_image` | Generate images from text descriptions |
| `venice_upscale_image` | Upscale and enhance images |
| `venice_text_to_speech` | Convert text to spoken audio |
| `venice_create_embeddings` | Generate text embeddings |

### Discovery

| Tool | Description |
|------|-------------|
| `venice_list_models` | List available models (text, image, code) |
| `venice_list_characters` | List character personas |
| `venice_list_image_styles` | List image style presets |

### Account Management

Requires an admin-level API key:

| Tool | Description |
|------|-------------|
| `venice_list_api_keys` | List all API keys |
| `venice_create_api_key` | Create a new API key |
| `venice_retrieve_api_key` | Get details for a key |
| `venice_delete_api_key` | Delete an API key |
| `venice_get_rate_limits` | View rate limits and usage |
| `venice_get_rate_limit_logs` | View rate limit history |

## Examples

**Ask Claude to generate an image:**
> "Use Venice to create an image of a sunset over mountains"

**Chat with a specific model:**
> "Ask Venice's DeepSeek model to explain quantum computing"

**Check your usage:**
> "Show my Venice API rate limits"

## Supported Models

**Language Models**: Llama 3.3 70B, DeepSeek R1, Qwen 3, Mistral, and more  
**Image Models**: Stable Diffusion 3.5, FLUX, Fluently XL  
**Embeddings**: BGE-M3 (1024 dimensions)  
**TTS**: Kokoro with multiple voice options

Run `venice_list_models` to see all currently available models.

## Requirements

- Node.js 18+
- Venice AI API key

## Links

- [Venice AI](https://venice.ai) - Platform home
- [Venice API Docs](https://docs.venice.ai) - API reference
- [MCP Documentation](https://modelcontextprotocol.io) - Protocol spec

## License

MIT - see [LICENSE](LICENSE)
