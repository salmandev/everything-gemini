#!/usr/bin/env python3
"""
Everything Gemini (everything-gemini) Full Multi-Agent Pipeline Example
Demonstrates a 4-stage autonomous lifecycle handoff:
Planner -> Database Migrator -> Performance Tuner -> Code Reviewer.
"""

import asyncio
import sys
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

async def stream_output(response_stream):
    captured = []
    async for token in response_stream:
        sys.stdout.write(token)
        sys.stdout.flush()
        captured.append(token)
    return "".join(captured)

async def run_feature_pipeline():
    print("🪐 Initializing Everything Gemini 4-Stage Autonomous Pipeline...\n")

    # Stage 1: Strategic Planner
    print("==================================================")
    print("🤖 [Stage 1/4] Strategic Planner (planner.md)")
    print("==================================================")
    planner_cfg = LocalAgentConfig(
        system_instructions=(
            "You are the Strategic Planner agent from everything-gemini. "
            "Decompose user requests into dependency maps and verifiable checklists."
        ),
        capabilities=CapabilitiesConfig(allow_network=False),
    )
    async with Agent(planner_cfg) as planner:
        resp = await planner.chat(
            "Plan a zero-downtime migration to add a multi-tenant 'organization_id' UUID column "
            "to a high-traffic PostgreSQL 'orders' table."
        )
        plan = await stream_output(resp)

    # Stage 2: Database Migrator
    print("\n\n==================================================")
    print("🗄️ [Stage 2/4] Database Migrator (database-migrator.md)")
    print("==================================================")
    migrator_cfg = LocalAgentConfig(
        system_instructions=(
            "You are the Database Migrator agent from everything-gemini. "
            "Design zero-downtime expand/contract SQL migrations with safe lock timeouts."
        ),
        capabilities=CapabilitiesConfig(allow_network=False),
    )
    async with Agent(migrator_cfg) as migrator:
        resp = await migrator.chat(
            f"Based on this plan, generate the Phase 1 (Expand) and Phase 2 (Contract) SQL scripts:\n\n{plan}"
        )
        migration_sql = await stream_output(resp)

    # Stage 3: Performance Tuner
    print("\n\n==================================================")
    print("⚡ [Stage 3/4] Performance Tuner (performance-tuner.md)")
    print("==================================================")
    tuner_cfg = LocalAgentConfig(
        system_instructions=(
            "You are the Performance Tuner agent from everything-gemini. "
            "Analyze lock contention, query execution plans, and index strategies."
        ),
        capabilities=CapabilitiesConfig(allow_network=False),
    )
    async with Agent(tuner_cfg) as tuner:
        resp = await tuner.chat(
            f"Audit this migration SQL for lock contention and missing concurrent indexes:\n\n{migration_sql}"
        )
        perf_review = await stream_output(resp)

    # Stage 4: Code Reviewer
    print("\n\n==================================================")
    print("🛡️ [Stage 4/4] Code Reviewer (code-reviewer.md)")
    print("==================================================")
    reviewer_cfg = LocalAgentConfig(
        system_instructions=(
            "You are the Code Reviewer agent from everything-gemini. "
            "Enforce zero regression, minimal diffs, and security compliance before final handoff."
        ),
        capabilities=CapabilitiesConfig(allow_network=False),
    )
    async with Agent(reviewer_cfg) as reviewer:
        resp = await reviewer.chat(
            f"Perform final quality audit on the proposed migration and performance review:\n\n{perf_review}"
        )
        await stream_output(resp)

    print("\n\n✨ 4-Stage Autonomous Pipeline executed successfully!")

if __name__ == "__main__":
    asyncio.run(run_feature_pipeline())
