# mcp-launches

Launches MCP — wraps Launch Library 2 API (ll.thespacedevs.com)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_upcoming_launches` | Fetch the next scheduled rocket launches from Launch Library 2. Returns launch name, NET (no-earlier-than) time, status, launch pad, rocket type, and mission description. Default 10 results. |
| `get_past_launches` | Fetch rocket launches that have already flown, sorted newest-first, from Launch Library 2. `launches` holds only those with a confirmed outcome — successful, failed or partial failure — so counting them answers "how many launches happened". A launch whose scheduled time has passed but whose outcome upstream has not yet confirmed is reported separately in `unconfirmed` with its current status, rather than being counted as flown. Use `since` and `until` to bound a window (ISO dates). Returns launch name, time, status, pad, rocket type, and mission description. Default 10 results. |
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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/launches/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Launches data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
