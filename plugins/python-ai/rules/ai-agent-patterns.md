# AI Agent & LLM Engineering Standards

- **Streaming First**: Always stream LLM response tokens and reasoning thoughts for enhanced observability and interactive responsiveness.
- **Strongly-Typed Tool Calls**: Validate tool schemas using Pydantic or TypedDict before exposing them to agents.
- **Graceful Error Recovery**: Handle API rate limits, model overloads, and context length limits with exponential backoff and message compaction.
