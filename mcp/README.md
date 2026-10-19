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

## Curated MCP Server Blueprints

Everything Gemini bundles ready-to-use blueprints in `mcp/mcp_config.example.json`:

| Server Name | Package | Purpose | Transport |
| :--- | :--- | :--- | :--- |
| **`memory`** | `@modelcontextprotocol/server-memory` | Persistent knowledge graph semantic memory across agent sessions | Stdio |
| **`fetch`** | `@modelcontextprotocol/server-fetch` | Efficient HTTP scraping and web documentation extraction | Stdio |
| **`redis`** | `@modelcontextprotocol/server-redis` | High-speed key-value caching, Pub/Sub, and distributed locks | Stdio |
| **`docker`** | `@modelcontextprotocol/server-docker` | Container lifecycle inspection, logs, and containerized testing | Stdio |
| **`clickhouse`** | `@modelcontextprotocol/server-clickhouse` | High-throughput OLAP analytics and vector similarity search | Stdio |
| **`sequential-thinking`** | `@modelcontextprotocol/server-sequential-thinking` | Dynamic multi-step reasoning, hypothesis testing & decomposition | Stdio |
| **`github`** | `@modelcontextprotocol/server-github` | Pull requests, issues, repo search, and commit inspection | Stdio |
| **`postgres`** | `@modelcontextprotocol/server-postgres` | PostgreSQL relational schema inspection and SQL queries | Stdio |
| **`sqlite`** | `@modelcontextprotocol/server-sqlite` | Local SQLite database querying and table inspection | Stdio |
| **`filesystem`** | `@modelcontextprotocol/server-filesystem` | Direct multi-directory filesystem inspection | Stdio |
| **`sentry`** | `@modelcontextprotocol/server-sentry` | Real-time production error tracking, issue triage, and stacktrace analysis | Stdio |
| **`slack`** | `@modelcontextprotocol/server-slack` | Automated incident channels, alert broadcasts, and team collaboration | Stdio |

## Tool Auto-Discovery & Execution
Once connected, tools declared by MCP servers are automatically injected into the agent's system prompt and executed through Antigravity's Language Server. Inspect active MCP servers in the Antigravity UI via **Additional Options (...) > MCP Servers**.

