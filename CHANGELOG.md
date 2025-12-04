# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-04

### Added

- Initial release of Venice AI MCP Server
- **Inference Tools**
  - `venice_chat` - Chat completion with Venice AI language models
  - `venice_generate_image` - Text-to-image generation
  - `venice_upscale_image` - AI image upscaling
  - `venice_text_to_speech` - Text-to-speech conversion
  - `venice_create_embeddings` - Text embedding generation
- **Discovery Tools**
  - `venice_list_models` - List available AI models
  - `venice_list_characters` - List Venice AI characters
  - `venice_list_image_styles` - List image style presets
- **Admin Tools**
  - `venice_list_api_keys` - List account API keys
  - `venice_create_api_key` - Create new API keys
  - `venice_retrieve_api_key` - Get API key details
  - `venice_delete_api_key` - Delete API keys
  - `venice_get_rate_limits` - Get rate limit information
  - `venice_get_rate_limit_logs` - Get rate limit history
- Full TypeScript support with type definitions
- Comprehensive documentation and examples
- Test verification for all 14 tools
