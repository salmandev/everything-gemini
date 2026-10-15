# Antigravity IDE Reference

Antigravity IDE is an AI-first integrated development environment built on top of VS Code, embedding agentic pair programming directly into the code editor.

---

## 1. Core AI Modalities

### A. Passive: Antigravity Tab (Autocomplete & Supercomplete)
- **Next-Intent Prediction**: Predicts your next keystroke, multi-line diff, or import statement.
- **Tab to Jump**: Anticipates your next navigation point across the file and jumps there upon pressing `Tab`.
- **Tab to Import**: Automatically resolves and inserts missing imports when new symbols are used.
- **Supercomplete**: Suggests larger structural diffs (including refactorings and deletions) in floating inline windows.

### B. Instructive: Inline Command (`Cmd+I` / `Ctrl+I`)
- Highlight any code block and press `Cmd+I` (macOS) or `Ctrl+I` (Linux/Windows) to refactor, explain, or optimize.
- Run without a selection to generate net-new code at the cursor.

### C. Collaborative: Sidebar Chat & Agent Mode
- Launch multi-step agent workflows capable of file navigation, terminal execution, and browser testing.
- Automatically reads workspace-scoped configurations from `.agents/`.

---

## 2. Editor UI Integrations

- **Inline Code Lenses**: Buttons directly above function declarations for quick actions: `Refactor`, `Write Tests`, `Explain Code`.
- **Visual Diff Overlays**: In-editor red/green diff gutters allowing one-click review and acceptance.
- **Diagnostic Auto-Fix**: Triggers the agent directly from inline compiler or linter errors to apply instant fixes.
