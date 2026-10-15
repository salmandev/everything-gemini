---
name: browser-qa-tester
description: >-
  Orchestrates automated UI, frontend, and end-to-end testing using Antigravity's native browser subagent with automatic WebP recording. Use when verifying web applications, visual bugs, or UI flows.
---

# Browser QA Tester

This skill automates visual testing and end-to-end verification of web applications using Antigravity's native `browser_subagent`.

## Why Browser Subagent?
- **Autonomous Interaction**: Navigates, clicks, fills inputs, and scrolls.
- **Automatic Recording**: Automatically captures WebP video recordings saved directly into the conversation artifacts directory.
- **Console & Network Inspection**: Intercepts unhandled errors, failed network requests, and visual layout glitches.

## Verification Procedure

### 1. Ensure Local Server is Running
Before launching the browser subagent, ensure the web app is running locally:
```bash
# Check if port is open
lsof -i :3000 || lsof -i :5173
```
If not running, launch with `run_command` and `IsDaemon: true`:
```bash
npm run dev
```

### 2. Invoke `browser_subagent`
Formulate a precise task description with explicit stop conditions:
- Specify target URL (e.g., `http://localhost:3000`).
- Specify unique element IDs or text labels to click/type.
- Define what constitutes success (e.g., "Verify dashboard renders after login").

### 3. Review Recording Artifacts
After the subagent finishes:
- Embed the generated WebP recording into your summary artifact:
  ```markdown
  ![Browser Test Recording](file:///absolute/path/to/artifacts/browser_test_demo.webp)
  ```
- Summarize any console warnings or errors detected during the test.

For specialized testing recipes (Responsive testing, Form verification), see [references/browser-recipes.md](./references/browser-recipes.md).
