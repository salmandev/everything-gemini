# Contributing to Everything Antigravity (`eagy`)

Thank you for your interest in contributing to **Everything Antigravity (`eagy`)**! Our goal is to build the highest-quality, most reliable, and most token-efficient agent harness and customization ecosystem for Google Antigravity.

---

## 🧭 Contribution Guidelines

We accept contributions in several areas:
1. **Skills (`skills/<name>/`)**: Modular runbooks for specific technical tasks.
2. **Rules (`rules/`)**: Standards and behavioral constraints for programming languages and architectures.
3. **Lifecycle Hooks (`hooks/`)**: Deterministic safety checks, formatters, and goal verifiers.
4. **Plugins (`plugins/<name>/`)**: Cohesive domain packages (Skills + Rules + Hooks + MCP).
5. **MCP Configs (`mcp/`)**: Verified Model Context Protocol configurations.
6. **Documentation (`docs/`)**: Deep dives into Antigravity internals, algorithms, and surfaces.

---

## 🛠️ Standards for Components

### 1. Skills Standards (`skills/<skill-name>/SKILL.md`)
Every skill must have a valid `SKILL.md` with YAML frontmatter:

```markdown
---
name: your-skill-name
description: >-
  Describe precisely what the skill does and when the agent should activate it.
  Always use third-person phrasing.
  Example: "Use this skill when the user asks to debug memory leaks in Node.js applications."
---

# Your Skill Title

Detailed step-by-step procedure...
```

**Key Rules for Skills:**
* **`name`**: Lowercase alphanumeric characters separated by hyphens (e.g. `docker-optimizer`).
* **`description`**: **This is the most critical field.** In Antigravity's progressive disclosure model, only the name and description are placed in the prompt initially. It must clearly state the triggers and objectives.
* **Progressive Disclosure**: Keep the main `SKILL.md` under 250 lines. Put lengthy API docs, tables, or guides in `references/` and link to them with relative markdown links.
* **Executable Helpers**: Put complex bash/python scripts in a `scripts/` directory within the skill folder so the agent can execute them.
* **No General Bloat**: Do not teach basic coding syntax the model already knows; focus strictly on opinionated, non-obvious workflows.

---

### 2. Rules Standards (`rules/`)
* Rules can be standalone Markdown files (`GEMINI.md`, `AGENTS.md`, or scoped rules in `rules/languages/` and `rules/paradigms/`).
* Rules should be concise, authoritative, and actionable. Avoid vague advice ("write good code"); provide concrete imperatives ("Always use strict TypeScript with `noImplicitAny: true`").
* Remember: Rules are deduplicated automatically by Antigravity if discovered via multiple inheritance paths.

---

### 3. Lifecycle Hooks Standards (`hooks/`)
* Hooks must comply with the Antigravity protojson schema:
  * Top-level keys are named hooks (e.g. `"safety-shield"`).
  * Supported event keys: `PreToolUse`, `PostToolUse`, `PreInvocation`, `PostInvocation`, `Stop`.
  * For `PreToolUse` and `PostToolUse`, use grouped syntax with `"matcher"` (regex) and `"hooks"`.
  * Shell scripts receive JSON on `stdin` and must output valid JSON on `stdout`.
  * All JSON property names in hook payloads use **camelCase** (e.g. `conversationId`, `stepIdx`, `toolCall`).
  * Return appropriate decisions: `"allow"`, `"deny"`, `"ask"`, `"force_ask"`, or `"continue"` for `Stop`.

---

### 4. Plugins Standards (`plugins/<plugin-name>/`)
A plugin bundles skills, rules, hooks, and MCP configurations together:
```text
plugins/<plugin-name>/
├── plugin.json        # {"name": "Plugin Display Name"}
├── hooks.json         # Optional lifecycle hooks
├── mcp_config.json    # Optional MCP configurations
├── rules/             # Optional Markdown rules
│   └── *.md
└── skills/            # Optional modular skills
    └── <skill-name>/
        └── SKILL.md
```

---

## 🧪 Validating Your Changes

Before submitting a Pull Request, run the automated validation suite:

```bash
# Run the validator script
bash scripts/validate.sh

# Or via npm
npm test
```

The validator checks:
- [x] All `SKILL.md` files have proper YAML frontmatter with `name` and `description`.
- [x] All JSON files (`package.json`, `plugin.json`, `hooks.json`, `mcp_config.json`) are syntactically valid JSON.
- [x] All hook scripts are executable (`chmod +x`).
- [x] No broken relative links within skills and documentation.

---

## 📝 Pull Request Process

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/my-new-skill
   ```
2. Commit your changes with conventional commit messages:
   ```bash
   git commit -m "feat(skills): add kubernetes-operator-deployer skill"
   ```
3. Run `npm test` and ensure all checks pass.
4. Push to your fork and submit a Pull Request with a clear description of the workflow.

Thank you for helping empower the Antigravity community!
