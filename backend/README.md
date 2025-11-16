# Sentinel Backend API

FastAPI backend for executing AI agent tests with multiple model providers.

## Quick Start

### 1. Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

Create a `.env` file in the project root:

```bash
# Copy the example
cp ../.env.example ../.env

# Edit and add your API keys
ANTHROPIC_API_KEY=your_actual_api_key_here
```

### 3. Run the Server

```bash
# From the backend directory
./start.sh

# Or run directly
python -m backend.main
```

The server will start on `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```

### Execute Test
```
POST /api/execution/execute
Content-Type: application/json

{
  "test_spec": {
    "name": "Simple Test",
    "model": "claude-3-5-sonnet-20241022",
    "inputs": {
      "query": "What is 2+2?"
    },
    "assertions": []
  }
}
```

### List Providers
```
GET /api/providers/list
```

### List Models for Provider
```
GET /api/providers/models/anthropic
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=backend --cov-report=html

# Run specific test file
pytest tests/test_providers.py
```

## Supported Providers

### Anthropic (Claude)
- ✅ Claude 3.5 Sonnet
- ✅ Claude 3.5 Haiku
- ✅ Claude 3 Opus
- ✅ Claude 3 Sonnet
- ✅ Claude 3 Haiku

**Configuration**: Set `ANTHROPIC_API_KEY` in `.env`

### OpenAI (GPT) - Coming Soon
- 🔜 GPT-4
- 🔜 GPT-4 Turbo
- 🔜 GPT-3.5 Turbo

## Architecture

```
backend/
├── providers/          # Model provider implementations
│   ├── base.py        # Abstract ModelProvider class
│   └── anthropic_provider.py
├── executor/          # Test execution engine
│   └── executor.py
├── api/               # FastAPI endpoints
│   ├── execution.py
│   └── providers.py
├── core/              # Schema and parser
│   ├── schema.py
│   └── parser.py
└── main.py           # FastAPI application
```

## Development

```bash
# Type checking
mypy .

# Linting
ruff check .

# Formatting
black .
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for Claude) | Anthropic API key |
| `OPENAI_API_KEY` | No | OpenAI API key (future) |
| `SENTINEL_HOST` | No | Server host (default: 0.0.0.0) |
| `SENTINEL_PORT` | No | Server port (default: 8000) |

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `400` - Bad request (invalid test spec or missing provider)
- `500` - Internal server error

All errors include a `detail` field with the error message.

## Cost Tracking

The Anthropic provider automatically calculates costs based on token usage. Pricing (as of November 2024):

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| Claude 3.5 Haiku | $1.00 | $5.00 |
| Claude 3 Opus | $15.00 | $75.00 |
| Claude 3 Sonnet | $3.00 | $15.00 |
| Claude 3 Haiku | $0.25 | $1.25 |

## License

See [LICENSE](../LICENSE)
