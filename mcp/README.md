# Model Context Protocol (MCP) in Antigravity

The Model Context Protocol (MCP) is an open standard enabling secure, bidirectional tool and resource sharing between Antigravity and external services.

## Configuration Locations
- **Global**: `~/.gemini/config/mcp_config.json` (applies to all sessions).
- **Workspace Project**: `.agents/mcp_config.json`.
- **Plugin Packaged**: `plugins/<plugin_name>/mcp_config.json`.

## Supported Transports

### 1. Stdio (Local Process)
Antigravity launches a local executable or Node/Python script, communicating over standard input and output:
```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "./data/app.db"],
      "env": {
        "DB_READONLY": "true"
      }
    }
  }
}
```

### 2. SSE (Remote HTTP / Server-Sent Events)
Antigravity connects to a remote MCP endpoint over HTTPS:
```json
{
  "mcpServers": {
    "remote-tools": {
      "serverUrl": "https://mcp.internal.company.com/sse"
    }
  }
}
```

## Tool Auto-Discovery & Execution
Once connected, tools declared by MCP servers are automatically injected into the agent's system prompt and executed through Antigravity's Language Server. Inspect active MCP servers in the Antigravity UI via **Additional Options (...) > MCP Servers**.
