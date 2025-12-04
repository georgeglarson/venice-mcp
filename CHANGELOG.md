# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-04

### 🎉 Major Improvements

#### Fixed Critical API Endpoint Issues
- **Fixed**: `venice_get_rate_limits` now uses correct endpoint `/api_keys/rate_limits` (was `/rate_limits`)
- **Fixed**: `venice_get_rate_limit_logs` now uses correct endpoint `/api_keys/rate_limits/logs` (was `/rate_limits/logs`)
- **Fixed**: `venice_create_api_key` now uses correct parameters (`description`, `apiKeyType`) instead of `name`
- **Removed**: `venice_list_image_styles` tool (endpoint does not exist in Venice API)

#### Architecture Refactoring
- **Refactored**: Complete modular architecture following Single Responsibility Principle
- **Added**: Separate modules for API client, tools, and types
- **Improved**: Code organization with dedicated directories for inference, discovery, and admin tools
- **Enhanced**: Type safety with comprehensive TypeScript type definitions

#### Testing & CI/CD
- **Added**: Automated test suite with Vitest
- **Added**: Unit tests for API client
- **Added**: Integration tests for all tools
- **Added**: GitHub Actions CI workflow (test on Node 18, 20, 22)
- **Added**: GitHub Actions publish workflow for automated npm releases
- **Added**: Test coverage reporting

#### Documentation & Community
- **Added**: CONTRIBUTING.md with development guidelines
- **Added**: GitHub issue templates (bug report, feature request)
- **Added**: CI badge to README
- **Enhanced**: README with development and testing sections
- **Improved**: Package keywords for better discoverability

#### Bug Fixes
- **Fixed**: `venice_list_characters` timeout issue by adding limit parameter (default: 20)
- **Fixed**: Character descriptions now truncated to prevent excessive output
- **Improved**: Error handling with more specific error messages

### 📦 Package Updates
- **Added**: 6 new keywords: `mcp-server`, `uncensored`, `privacy`, `open-models`, `sdk`, `typescript`
- **Updated**: Version bumped to 1.1.0
- **Enhanced**: `prepublishOnly` script now runs tests before publishing

### 🔧 Technical Details

**New Project Structure:**
```
src/
├── client/
│   └── venice-api.ts       # API client abstraction
├── tools/
│   ├── inference/          # Chat, image, TTS, embeddings
│   ├── discovery/          # Models, characters
│   └── admin/              # API key management
├── types/
│   └── api-types.ts        # Type definitions
└── index.ts                # Main entry point
```

**Test Coverage:**
- 9 tests passing
- Unit tests for API client
- Integration tests for tool schemas and endpoints
- Automated testing on every PR

**CI/CD Pipeline:**
- Automated testing on Node.js 18.x, 20.x, 22.x
- Security audits on every build
- Automated npm publishing on GitHub releases

### ⚠️ Breaking Changes

None. All changes are backward compatible.

---

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

[1.1.0]: https://github.com/georgeglarson/venice-mcp/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/georgeglarson/venice-mcp/releases/tag/v1.0.0
