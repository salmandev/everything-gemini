---
name: antigravity-sdk-orchestrator
description: >-
  Orchestrates, configures, and tests AI agents programmatically using the official google-antigravity Python SDK. Use when automating agent pipelines or embedding Antigravity into Python services.
---

# Antigravity Python SDK Orchestrator

This skill guides the programmatic orchestration of Antigravity agents using `google-antigravity`.

## Setup & Installation

```bash
pip install google-antigravity
```

## Core Agent Lifecycle Pattern

```python
import asyncio
import sys
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

async def run_agent_workflow():
    # Configure agent with specific capabilities
    config = LocalAgentConfig(
        system_instructions="You are an autonomous CI test auditor.",
        capabilities=CapabilitiesConfig(), # Enables write tools if required
    )

    # Agent runs inside an async context manager
    async with Agent(config) as agent:
        response = await agent.chat("Audit all test files in tests/ and report missing cases.")

        # Stream reasoning thoughts
        async for thought in response.thoughts:
            print(f"[Reasoning] {thought}")

        # Stream tool calls
        async for call in response.tool_calls:
            print(f"[Tool Executed] {call.name}: {call.args}")

        # Stream response text
        async for token in response:
            sys.stdout.write(token)
            sys.stdout.flush()

if __name__ == "__main__":
    asyncio.run(run_agent_workflow())
```

## Key Architectural Notes
- The SDK manages compiled binary discovery, tool wiring, and hook execution automatically.
- Always use `async with Agent(config)` to guarantee clean process shutdown and sandbox deallocation.
