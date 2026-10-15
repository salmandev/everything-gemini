# Antigravity CLI (`agy`) Reference

The Antigravity CLI (`agy`) is the high-performance, terminal-based interface designed for keyboard-driven workflows, headless CI/CD automation, and fast local prototyping.

---

## 1. Getting Started

- **Launch Interactive TUI**:
  ```bash
  agy
  ```
- **Run Headless Non-Interactive Task**:
  ```bash
  agy -p "Run tests and fix all lint errors"
  ```
- **Exit CLI**: `Ctrl+D Ctrl+D` or type `/exit`.

---

## 2. CLI Flags & Subcommands

```text
Usage: agy [options] [prompt]

Options:
  -p, --prompt <string>       Execute prompt in headless mode and exit
  --model <string>            Select Gemini model (e.g. gemini-3.8-flash, gemini-3.5-pro)
  --sandbox                   Run terminal commands inside isolated container
  --strict                    Strict permission policy (ask before every tool call)
  --version                   Show CLI version
  -h, --help                  Show help
```

---

## 3. Configuration

Configured via `~/.gemini/antigravity-cli/settings.json`:
```json
{
  "model": "auto",
  "toolExecutionPolicy": "request-review",
  "notifications": true
}
```
