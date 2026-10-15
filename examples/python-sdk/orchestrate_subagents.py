#!/usr/bin/env python3
"""
Everything Gemini (everything-gemini) Python SDK Example
Demonstrates programmatic multi-agent orchestration using the official google-antigravity SDK.
"""

import asyncio
import sys
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

async def run_pipeline():
    print("🪐 Initializing Everything Gemini Multi-Agent Orchestrator...")

    # 1. Spawn Planner Subagent
    planner_config = LocalAgentConfig(
        system_instructions=(
            "You are the Strategic Planner agent from everything-gemini. "
            "Analyze the codebase, break the feature into phased milestones, and map architectural risks."
        ),
        capabilities=CapabilitiesConfig(allow_network=False),
    )

    async with Agent(planner_config) as planner:
        print("\n[Phase 1] 🤖 Executing Planner Subagent...")
        planner_response = await planner.chat(
            "Draft an architecture plan to add Redis caching to the API service."
        )

        plan_output = []
        async for token in planner_response:
            sys.stdout.write(token)
            sys.stdout.flush()
            plan_output.append(token)
        
        plan_text = "".join(plan_output)

    # 2. Handoff Plan to Code Reviewer Subagent
    reviewer_config = LocalAgentConfig(
        system_instructions=(
            "You are the Code Reviewer agent from everything-gemini. "
            "Audit the architectural plan for edge cases, failure modes, and security vulnerabilities."
        ),
        capabilities=CapabilitiesConfig(allow_network=False),
    )

    async with Agent(reviewer_config) as reviewer:
        print("\n\n[Phase 2] 🛡️ Handing off to Code Reviewer Subagent...")
        review_response = await reviewer.chat(
            f"Review this architectural proposal and list all potential edge cases:\n\n{plan_text}"
        )

        async for token in review_response:
            sys.stdout.write(token)
            sys.stdout.flush()

    print("\n\n✨ Multi-agent orchestration completed successfully!")

if __name__ == "__main__":
    asyncio.run(run_pipeline())
