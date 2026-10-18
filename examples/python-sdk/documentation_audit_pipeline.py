#!/usr/bin/env python3
"""
Everything Gemini (everything-gemini) Documentation & Link Verification Pipeline Example
Demonstrates a 3-stage autonomous lifecycle handoff:
Architect -> Code Reviewer -> Documentation Writer.
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

async def run_documentation_pipeline():
    print("🪐 Initializing Everything Gemini Documentation Audit Pipeline...\n")

    # Stage 1: Architect (Define system changes & ADR)
    print("==================================================")
    print("📐 [Stage 1/3] Architect (architect.md)")
    print("==================================================")
    architect_cfg = LocalAgentConfig(
        system_instructions=(
            "You are the Architect subagent from everything-gemini. "
            "Define system boundaries, component schemas, and write Architecture Decision Records (ADRs)."
        ),
        capabilities=CapabilitiesConfig(allow_network=False),
    )
    async with Agent(architect_cfg) as architect:
        resp = await architect.chat(
            "Draft an Architecture Decision Record (ADR-025) for introducing Connect-RPC and "
            "Protocol Buffers alongside our existing REST endpoints for web client streaming."
        )
        adr_spec = await stream_output(resp)

    # Stage 2: Code Reviewer (Audit security, backwards compatibility & link requirements)
    print("\n\n==================================================")
    print("🔍 [Stage 2/3] Code Reviewer (code-reviewer.md)")
    print("==================================================")
    reviewer_cfg = LocalAgentConfig(
        system_instructions=(
            "You are the Code Reviewer subagent from everything-gemini. "
            "Critique architecture designs for backward-compatibility, link integrity, and edge cases."
        ),
        capabilities=CapabilitiesConfig(allow_network=False),
    )
    async with Agent(reviewer_cfg) as reviewer:
        resp = await reviewer.chat(
            f"Review this ADR specification for API backward compatibility and documentation completeness:\n\n{adr_spec}"
        )
        review_feedback = await stream_output(resp)

    # Stage 3: Documentation Writer (Generate developer docs with clickable file:// links)
    print("\n\n==================================================")
    print("✍️ [Stage 3/3] Documentation Writer (documentation-writer.md)")
    print("==================================================")
    doc_writer_cfg = LocalAgentConfig(
        system_instructions=(
            "You are the Documentation Writer subagent from everything-gemini. "
            "Generate developer-facing markdown documentation, quickstarts, and ensure all file references "
            "strictly use clickable file:// markdown links."
        ),
        capabilities=CapabilitiesConfig(allow_network=False),
    )
    async with Agent(doc_writer_cfg) as doc_writer:
        resp = await doc_writer.chat(
            f"Generate the developer quickstart guide and API reference in markdown based on the ADR "
            f"and reviewer feedback:\n\nADR:\n{adr_spec}\n\nFeedback:\n{review_feedback}"
        )
        final_docs = await stream_output(resp)

    print("\n\n==================================================")
    print("✨ Documentation Pipeline Complete!")
    print("==================================================")
    print("Generated Documentation Size:", len(final_docs), "characters")

if __name__ == "__main__":
    asyncio.run(run_documentation_pipeline())
