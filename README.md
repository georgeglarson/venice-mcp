# Venice AI MCP Server

[![npm version](https://badge.fury.io/js/%40anthropic-ai%2Fvenice-mcp.svg)](https://www.npmjs.com/package/venice-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-1.12.0-blue)](https://modelcontextprotocol.io)

A Model Context Protocol (MCP) server that provides seamless integration with the [Venice AI](https://venice.ai) platform. This server enables AI assistants like Claude to access Venice AI's full suite of capabilities including chat, image generation, text-to-speech, embeddings, and administrative functions.

## Features

- **Chat Completion** - Access Venice AI's language models including Llama, DeepSeek, Qwen, and more
- **Image Generation** - Create images with Stable Diffusion, FLUX, and other models
- **Image Upscaling** - Enhance and upscale images with AI
- **Text-to-Speech** - Convert text to natural-sounding audio
- **Embeddings** - Generate text embeddings for semantic search and RAG
- **Model Discovery** - List available text and image models
- **Character Personas** - Access Venice AI's character library
- **Style Presets** - Browse 60+ image generation styles
- **API Key Management** - Create, list, and delete API keys (admin)
- **Rate Limits** - Monitor usage and rate limits (admin)

## Installation

### Via npm (recommended)

```bash
npm install -g venice-mcp
```

### From source

```bash
git clone https://github.com/anthropics/venice-mcp.git
cd venice-mcp
npm install
npm run build
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VENICE_API_KEY` | Yes | Your Venice AI API key ([Get one here](https://venice.ai/settings/api)) |

### Claude Desktop

Add to your Claude Desktop configuration (`~/.config/Claude/claude_desktop_config.json` on Linux/macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

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

### Running Manually

```bash
export VENICE_API_KEY="your-api-key-here"
node dist/index.js
```

## Available Tools

### Inference Tools

| Tool | Description |
|------|-------------|
| `venice_chat` | Send messages to Venice AI language models |
| `venice_generate_image` | Generate images from text prompts |
| `venice_upscale_image` | Upscale and enhance images |
| `venice_text_to_speech` | Convert text to audio |
| `venice_create_embeddings` | Generate text embeddings |

### Discovery Tools

| Tool | Description |
|------|-------------|
| `venice_list_models` | List available AI models (text/image/code) |
| `venice_list_characters` | List Venice AI character personas |
| `venice_list_image_styles` | List available image style presets |

### Admin Tools (requires Admin API key)

| Tool | Description |
|------|-------------|
| `venice_list_api_keys` | List all API keys on account |
| `venice_create_api_key` | Create a new API key |
| `venice_retrieve_api_key` | Get details for a specific key |
| `venice_delete_api_key` | Delete an API key |
| `venice_get_rate_limits` | Get current rate limits and usage |
| `venice_get_rate_limit_logs` | Get rate limit history logs |

## Usage Examples

### Chat with an AI model

```
User: Use Venice to ask Llama about quantum computing
Claude: [uses venice_chat tool]
```

### Generate an image

```
User: Generate a cyberpunk cityscape with Venice AI
Claude: [uses venice_generate_image tool]
```

### Text-to-speech

```
User: Convert "Hello world" to speech using Venice
Claude: [uses venice_text_to_speech tool]
```

### Manage API keys

```
User: Show me my Venice API keys
Claude: [uses venice_list_api_keys tool]
```

## Supported Models

### Language Models
- Llama 3.3 70B, Llama 3.2 3B
- DeepSeek R1, DeepSeek v3.2
- Qwen 3 (4B, 235B, Coder 480B)
- Mistral 31 24B
- Google Gemma 3 27B
- Grok 41 Fast
- And more...

### Image Models
- Venice SD35
- HiDream
- Nano Banana Pro
- Qwen Image
- WAI Illustrious

### Embedding Models
- BGE-M3 (1024 dimensions)

### TTS Models
- Kokoro TTS (multiple voices)

## Test Results

All tools have been tested and verified working:

```
✅ venice_chat - Successful response from llama-3.3-70b
✅ venice_generate_image - Generated image with venice-sd35
✅ venice_upscale_image - Ready (requires base64 input)
✅ venice_text_to_speech - Generated 41KB MP3 audio
✅ venice_create_embeddings - Generated 1024-dim vectors
✅ venice_list_models - Listed 19 text + 7 image models
✅ venice_list_characters - Listed Venice AI personas
✅ venice_list_image_styles - Listed 67+ style presets
✅ venice_list_api_keys - Listed account API keys
✅ venice_create_api_key - Created test key successfully
✅ venice_retrieve_api_key - Ready
✅ venice_delete_api_key - Deleted test key successfully
✅ venice_get_rate_limits - Retrieved full rate limit data
✅ venice_get_rate_limit_logs - Ready
```

## Requirements

- Node.js 18+
- Venice AI API key
- For admin tools: Admin-level API key

## Links

- [Venice AI Platform](https://venice.ai)
- [Venice AI API Documentation](https://docs.venice.ai)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For Venice AI platform support: [support@venice.ai](mailto:support@venice.ai)

For MCP server issues: Open a GitHub issue
