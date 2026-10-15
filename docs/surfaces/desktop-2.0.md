# Antigravity 2.0 (Desktop Application) Guide

Antigravity 2.0 is the standalone desktop Electron application providing a complete, IDE-independent command center for agent orchestration.

---

## 1. Unified Interface Surfaces

### Left-Hand Navigation
- **New Conversation**: Starts a fresh agent thread with isolated context.
- **Projects**: Switch between different workspace directories. Project-level settings take precedence over global defaults.
- **Scheduled Tasks**: Manage recurring background tasks (cron expressions) and delayed timers.
- **Skills & Customizations**: View active skills, rules, plugins, and MCP servers.
- **Settings**: Global configuration for models, sandbox permissions, and tool policies.

### Chat Canvas
- **Slash Commands (`/`)**: Type `/` to invoke `/goal`, `/plan`, `/grill-me`, `/learn`, or `/schedule`.
- **`@` Mentions**: Attach context directly to messages:
  - `@files` and `@folders`
  - `@conversations` (previous chats)
  - `@terminals` (active terminal buffers)
  - `@rules` and `@mcp` tools
- **Media Uploads**: Drag-and-drop screenshots or architecture diagrams directly into the canvas.

### Auxiliary Panes
- **Subagents**: Real-time status of running subagents (e.g. `browser_subagent`).
- **Background Tasks**: Live logs and outputs of background commands and test runners.
- **Artifacts**: Dedicated viewer for rendered Markdown artifacts, Mermaid diagrams, and WebP session recordings.
- **Files Changed**: Git-style diff viewer of files modified during the conversation.
- **Terminals**: Interactive shell tabs running alongside the agent.
