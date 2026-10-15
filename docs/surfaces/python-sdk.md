# Antigravity Python SDK Reference

The public Python SDK allows developers to embed Antigravity agents programmatically into Python scripts, backend pipelines, and automated test runners.

- **PyPI Package**: `google-antigravity`
- **GitHub Repository**: [google-antigravity/antigravity-sdk-python](https://github.com/google-antigravity/antigravity-sdk-python)

---

## 1. Installation

```bash
pip install google-antigravity
```

---

## 2. Core Concepts

### Async Context Management
Agents are managed via `async with Agent(config) as agent:` which guarantees binary discovery, tool lifecycle orchestration, and process cleanup.

### Streaming Reasoning Thoughts & Tools
```python
import asyncio
import sys
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

async def main():
    config = LocalAgentConfig(
        system_instructions="You are an autonomous code auditor.",
        capabilities=CapabilitiesConfig()
    )

    async with Agent(config) as agent:
        response = await agent.chat("Review the auth flow in src/auth.ts")

        # Stream reasoning thoughts
        async for thought in response.thoughts:
            print(f"[Reasoning] {thought}")

        # Stream tool calls
        async for call in response.tool_calls:
            print(f"[Tool] {call.name}({call.args})")

        # Stream final output tokens
        async for token in response:
            sys.stdout.write(token)
            sys.stdout.flush()

if __name__ == "__main__":
    asyncio.run(main())
```
