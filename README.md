# mcp-launches

Launches MCP — wraps Launch Library 2 API (ll.thespacedevs.com)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_upcoming_launches` | Fetch the next scheduled rocket launches from Launch Library 2. Returns launch name, NET (no-earlier-than) time, status, launch pad, rocket type, and mission description. Default 10 results. |
| `get_past_launches` | Fetch recently completed rocket launches from Launch Library 2, sorted newest-first. Returns launch name, actual launch time, status, pad, rocket type, and mission description. Default 10 results. |
| `get_launch` | Get full details for a specific launch by ID. Returns name, time, status, pad, rocket, mission, orbit info, video links, and mission patches. |
| `search_launches` | Search launches by keyword (rocket name, mission, agency). Returns matching launches with name, time, status, pad, rocket, and mission. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "launches": {
      "url": "https://gateway.pipeworx.io/launches/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Launches data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
