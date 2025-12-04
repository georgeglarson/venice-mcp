# Contributing to venice-mcp

Thank you for your interest in contributing to the Venice MCP Server! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/georgeglarson/venice-mcp.git
   cd venice-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your Venice API key**
   ```bash
   export VENICE_API_KEY="your-api-key-here"
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## Project Structure

```
venice-mcp/
├── src/
│   ├── client/          # API client
│   ├── tools/           # MCP tool implementations
│   │   ├── inference/   # Chat, image, TTS, embeddings
│   │   ├── discovery/   # Models, characters
│   │   └── admin/       # API key management
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Main entry point
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
└── dist/                # Compiled output
```

## Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Run tests**
   ```bash
   npm test
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Description of your changes"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes

## Code Style

- Use TypeScript for all new code
- Follow the Single Responsibility Principle
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Testing

- Write unit tests for new functions
- Write integration tests for new tools
- Ensure all tests pass before submitting PR
- Aim for high test coverage

## Commit Messages

Use clear and descriptive commit messages:
- `feat: Add new tool for X`
- `fix: Correct endpoint path for Y`
- `docs: Update README with Z`
- `test: Add tests for W`
- `refactor: Improve V implementation`

## Reporting Issues

When reporting issues, please include:
- Venice MCP version
- Node.js version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error messages or logs

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
