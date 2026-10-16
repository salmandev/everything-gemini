# AI Agent & LLM Engineering Standards (Python & Gemini)

These principles guide the development and orchestration of AI agents, tool declarations, and model interactions using Python and the Gemini / Antigravity SDKs.

---

## 1. Streaming & Real-Time Reasoning
- **Streaming First**:
  - Always stream response tokens for interactive user sessions (`client.models.generate_content_stream`) to minimize Time-to-First-Token (TTFT).
- **Separation of Reasoning & Final Output**:
  - Distinguish agent thought sequences from final customer-facing responses. Stream thinking blocks to developer logs while streaming final text to UI clients.
- **Async Event Loops**:
  - Leverage `asyncio` for non-blocking I/O when handling parallel agent invocations and external tool queries.

---

## 2. Strongly-Typed Tool Declarations
- **Pydantic Tool Schemas**:
  - Define all agent tool parameters using Pydantic `BaseModel` with explicit type annotations and field descriptions:
  ```python
  from pydantic import BaseModel, Field

  class QueryDatabaseArgs(BaseModel):
      query: str = Field(description="Sanitized SQL query to execute")
      limit: int = Field(default=50, ge=1, le=1000, description="Max rows to return")
  ```
- **Unambiguous Parameter Descriptions**:
  - Clearly document valid enum values, format constraints, and default behaviors so the model never generates hallucinated arguments.
- **Fail-Fast Boundary Validation**:
  - Catch Pydantic `ValidationError` at the tool gate and return structured error messages back to the agent for self-correction.

---

## 3. Structured Output Guarantees
- **JSON Schema Enforcement**:
  - Use `response_mime_type="application/json"` combined with `response_schema` to guarantee valid JSON formatting without regex post-processing.
- **Envelope Contracts**:
  - Always wrap structured agent payloads in standardized envelopes containing status, findings, and metadata.

---

## 4. Context Caching & Token Optimization
- **Deterministic Prompt Prefixing**:
  - Place static repository maps, immutable system instructions, and schema definitions at the very beginning of the prompt to maximize Gemini 3.8 static prefix cache hits.
- **Cache Eviction Discipline**:
  - For corpuses exceeding 32,768 tokens, establish explicit TTL-based Context Caches (`client.caches.create`) to achieve ~75% cost reduction.
- **Progressive Disclosure Memory**:
  - In long-running multi-turn sessions, summarize intermediate reasoning steps and compact transcript history to prevent context overflow.

---

## 5. Deterministic Subagent Orchestration
- **Explicit Scoping**:
  - Delegate tasks to specialized subagents with strictly isolated toolsets (e.g. read-only subagents for code search, execution subagents for testing).
- **Structured Synthesis Handoff**:
  - Child agents must return standardized Markdown reports containing:
    1. Executive Summary
    2. Modified Files List
    3. Test / Verification Output
    4. Open Risks & Blockers

---

## 6. Resilience & Fault Tolerance
- **Exponential Backoff with Jitter**:
  - Wrap API calls in retry handlers catching HTTP 429 (rate limit) and 503 (service overloaded) with exponential backoff and randomized jitter.
- **Fallback Models**:
  - Configure automatic failover from high-reasoning models (e.g. Gemini 1.5 Pro) to high-throughput models (e.g. Gemini 1.5 Flash) during transient network outages.
