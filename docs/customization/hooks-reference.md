# Lifecycle Hooks Reference (`hooks.json`)

Lifecycle hooks allow executing external shell commands at deterministic interception points during Antigravity's agent execution loop.

---

## 1. Schema & Common Contract

All hook payloads sent to `stdin` contain common metadata in camelCase format:
```json
{
  "conversationId": "950f349d-7f23-47e6-ba8f-41603dd7d295",
  "workspacePaths": ["/Users/project"],
  "transcriptPath": "/Users/project/.gemini/antigravity/transcript.jsonl",
  "artifactDirectoryPath": "/Users/project/.gemini/antigravity/artifacts",
  "modelName": "auto"
}
```

---

## 2. Event Contracts

### A. `PreToolUse`
Fires immediately before a tool runs. Used for safety gating, parameter overwriting, or policy enforcement.
- **Payload (`stdin`)**: Includes `toolCall: { name, args }` and `stepIdx`.
- **Response (`stdout`)**:
  ```json
  {
    "decision": "allow | deny | ask | force_ask",
    "reason": "Detailed explanation if denied or asking user",
    "overwrite": {
      "CommandLine": "safe command"
    }
  }
  ```

### B. `PostToolUse`
Fires after a tool step completes. Used for cleanup, logging, or auto-formatting.
- **Payload (`stdin`)**: Includes `stepIdx`, `error` (if tool failed), plus common fields.
- **Response (`stdout`)**: Expects an empty JSON object: `{}`.

### C. `PreInvocation`
Fires before the model is called. Used to inject ephemeral warnings or dynamic context.
- **Payload (`stdin`)**: Includes `invocationNum`, `initialNumSteps`, plus common fields.
- **Response (`stdout`)**:
  ```json
  {
    "injectSteps": [
      {
        "ephemeralMessage": "Transient warning: Ensure all unit tests pass before finishing."
      }
    ]
  }
  ```

### D. `PostInvocation`
Fires after the model produces output and tool calls.
- **Payload (`stdin`)**: Includes `invocationNum`, plus common fields.
- **Response (`stdout`)**:
  ```json
  {
    "injectSteps": [],
    "terminationBehavior": "force_continue | terminate | \"\""
  }
  ```

### E. `Stop`
Fires when the agent's execution loop attempts to terminate. Used to verify goals.
- **Payload (`stdin`)**: Includes `executionNum`, `terminationReason`, `fullyIdle`, `error`.
- **Response (`stdout`)**:
  ```json
  {
    "decision": "continue",
    "reason": "Tests are still failing. Fix them before finishing."
  }
  ```
  *(Return `{}` to allow the agent to stop).*
