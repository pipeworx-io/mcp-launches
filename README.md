# mcp-launches

MCP server for rocket launch data via the [Launch Library 2 API](https://thespacedevs.com/llapi). No authentication required.

## Tools

| Tool | Description |
|------|-------------|
| `get_upcoming_launches` | Get upcoming rocket launches |
| `get_past_launches` | Get past rocket launches |
| `get_launch` | Get full launch details by ID |
| `search_launches` | Search launches by keyword |

## Quickstart (Pipeworx Gateway)

```bash
curl -X POST https://gateway.pipeworx.io/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "launches_get_upcoming_launches",
      "arguments": { "limit": 5 }
    },
    "id": 1
  }'
```

## License

MIT
