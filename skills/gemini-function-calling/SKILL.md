---
name: gemini-function-calling
description: >-
  Designs, validates, and tests production Gemini function calling schemas, structured outputs with Pydantic/JSON Schema, parallel tool dispatch, and error recovery loops.
---

# Gemini Function Calling & Structured Outputs

## Overview
Gemini models support native, high-precision function calling and constrained JSON output schemas. This skill outlines best practices for defining deterministic tool declarations, handling parallel tool invocations, enforcing response schemas, and recovering gracefully from tool execution exceptions.

## Core Capabilities

### 1. Function Declarations (Tools)
Define tools with clear semantics, parameter types, descriptions, and required constraints:

```python
from google.genai import types

def get_db_schema_declaration() -> types.FunctionDeclaration:
    return types.FunctionDeclaration(
        name="query_database",
        description="Executes a read-only SQL query against the application replica.",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "query": types.Schema(
                    type=types.Type.STRING,
                    description="The SQL query to execute. Must be a SELECT statement."
                ),
                "limit": types.Schema(
                    type=types.Type.INTEGER,
                    description="Maximum number of rows to return (default: 50, max: 200)."
                )
            },
            required=["query"]
        )
    )
```

### 2. Structured JSON Outputs (`response_schema`)
When an application requires guaranteed JSON outputs matching a domain model, configure `response_mime_type="application/json"` and supply a `response_schema` (or Pydantic class):

```python
from pydantic import BaseModel, Field

class CodeAnalysisReport(BaseModel):
    summary: str = Field(description="High-level architecture assessment")
    vulnerabilities: list[str] = Field(description="List of identified security vulnerabilities")
    risk_score: int = Field(description="Risk rating from 1 (lowest) to 10 (critical)", ge=1, le=10)

config = types.GenerateContentConfig(
    response_mime_type="application/json",
    response_schema=CodeAnalysisReport,
    temperature=0.1
)
```

### 3. Parallel & Multi-Turn Function Calling
- **Parallel Dispatch**: Gemini can return multiple function calls in a single response turn. Process independent read operations concurrently using `asyncio.gather` or `Promise.all`.
- **Function Response Envelope**: Return the results of each tool back to the model with matching tool names and execution status:

```python
tool_response_part = types.Part.from_function_response(
    name="query_database",
    response={"status": "success", "rows": rows, "count": len(rows)}
)
```

### 4. Error Recovery & Defensive Handling
When a tool execution fails (e.g., database timeout or syntax error):
1. **Never suppress the error silently**: Feed the error back to Gemini in the function response envelope.
2. **Include Contextual Remediation**: Inform the model why the call failed so it can self-correct in the next turn:

```python
error_part = types.Part.from_function_response(
    name="query_database",
    response={
        "status": "error",
        "error_code": "SYNTAX_ERROR",
        "message": "Column 'user_id' does not exist in table 'accounts'. Available columns: [id, account_number, balance]."
    }
)
```

## Verification Checklist
- [ ] Tool parameters have unambiguous `description` fields
- [ ] `required` fields explicitly defined
- [ ] Read-only vs destructive operations strictly separated
- [ ] Tool execution errors safely fed back to model for autonomous self-correction
