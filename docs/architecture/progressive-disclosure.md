# Progressive Disclosure in Antigravity

One of the greatest bottlenecks in modern agentic coding is **prompt bloat**. When an agent harness attempts to inject 50 different rules, 30 different stack guides, and full documentation on every single turn, it degrades the model's instruction-following accuracy and consumes tens of thousands of tokens per turn.

Antigravity solves this with **Progressive Disclosure**.

---

## 1. How Progressive Disclosure Works

Instead of injecting entire skill files (`SKILL.md`) into the system prompt:
1. **Metadata-Only Injection**: Only the `name` and `description` from the YAML frontmatter are provided to the model in the system prompt.
2. **Intent Recognition**: When a user's prompt or subtask matches a skill's description, the model proactively reads the complete `SKILL.md` using `view_file`.
3. **Subdocument Linking**: Inside `SKILL.md`, bulky references are stored in `references/` or `examples/`, which are only fetched if specific edge-case guidance is required.

---

## 2. Comparative Token Consumption

```
+------------------------------------+--------------------------+
| Harness Strategy                   | Baseline Prompt Overhead |
+------------------------------------+--------------------------+
| Monolithic Prompts (56+ skills)    | ~52,000+ tokens / turn   |
| Everything Gemini Progressive Disc.| ~4,100 tokens / turn     |
+------------------------------------+--------------------------+
| Net Token Savings                  | 85% - 92% (>45,000 saved)|
+------------------------------------+--------------------------+
```

---

## 3. Best Practices for Writing Skills

1. **Third-Person Triggers**: Write descriptions in third-person stating *what* the skill does and *when* to invoke it:
   ```yaml
   description: >-
     Enforces strict Test-Driven Development (Red-Green-Refactor). Use this skill when the user asks to implement a new feature, fix a bug, or refactor logic using TDD.
   ```
2. **Lean Instructions**: Keep the root `SKILL.md` concise (< 200 lines).
3. **Move Bulky Tables to `references/`**: Link them via standard Markdown links (`[patterns.md](./references/patterns.md)`).
