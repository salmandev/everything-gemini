# Memory & Context Architecture

Antigravity employs a three-tier memory model to balance long-term project recall, immediate trajectory history, and structured user-facing reporting:

```
+---------------------------------------------------------------------------------+
|                                 ANTIGRAVITY MEMORY                              |
+--------------------------+------------------------------+-----------------------+
| 1. Knowledge Items (KI)  | 2. Dual Transcripts          | 3. Brain Artifacts    |
| (Persistent Architecture)| (Execution Trajectory)       | (Structured Output)   |
+--------------------------+------------------------------+-----------------------+
| - Stored in              | - transcript.jsonl (Compact) | - Markdown files in   |
|   <appDataDir>/knowledge | - transcript_full.jsonl      |   <appDataDir>/brain/ |
| - metadata.json +        |   (Untruncated)              | - Alerts, Mermaid,    |
|   artifacts/             | - Keyed by Conversation ID   |   Tables, Carousels,  |
| - Checked before         | - Token-efficient recall     |   Live Diff blocks    |
|   research               |                              |                       |
+--------------------------+------------------------------+-----------------------+
```

---

## 1. Knowledge Items (KI)

**Knowledge Items** capture curated, localized context about specific repositories.
- **Location**: `<appDataDir>/knowledge/<ki-id>/`
- **Contents**:
  - `metadata.json`: Summary, timestamps, and references to original source files.
  - `artifacts/`: Related architecture blueprints, setup instructions, and known bug gotchas.
- **Mandatory Agent Rule**: Antigravity agents check KI summaries *before* performing redundant codebase research.

---

## 2. Dual Transcripts

Every Antigravity conversation produces two parallel chronological logs in JSON Lines (`.jsonl`) format under `<appDataDir>/brain/<conversation-id>/.system_generated/logs`:

1. **`transcript.jsonl`**: Token-efficient version where very large outputs (such as massive grep results or lengthy terminal logs) are truncated. Ideal for rapid history search and recalling earlier steps.
2. **`transcript_full.jsonl`**: The untruncated record containing verbatim outputs for deep debugging.

---

## 3. Brain Artifacts

Rather than flooding the user chat with 500-line code blocks or raw terminal dumps, Antigravity renders **Artifacts** stored in `<appDataDir>/brain/<conversation-id>/`:
- **Alert Callouts**: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`.
- **Mermaid Diagrams**: System architectures, sequence diagrams, and class structures.
- **Diff Blocks**: Clean visual before/after changes.
- **Carousels**: Four-backtick (````carousel ... ````) interactive slides.
- **Media Embeds**: Embedded WebP recordings from `browser_subagent` and image assets (`![caption](/path/to/media.webp)`).
