# 🛠️ CLI Workflow Automation Example

This example demonstrates how to automate workspace onboarding and component management using the **`everything-gemini`** CLI in scripts, CI pipelines, or devcontainer lifecycles.

---

## 🏃 Running the Demo

Make the script executable and run:

```bash
chmod +x demo_workflow.sh
./demo_workflow.sh
```

---

## 📋 What the Script Does

1. **Creates an isolated temporary directory** to simulate a fresh project repository.
2. **Initializes the workspace** with `everything-gemini init --workspace <dir>`.
3. **Installs granular components** on-demand:
   ```bash
   everything-gemini add skill agent-evals
   everything-gemini add skill docker-compose-orchestrator
   everything-gemini add agent architect
   ```
4. **Validates the skill frontmatter & boundary definitions**:
   ```bash
   everything-gemini test-skill agent-evals
   ```

---

## 🐳 Devcontainer Integration

You can integrate `everything-gemini` into your `.devcontainer/devcontainer.json` `postCreateCommand`:

```json
{
  "name": "Gemini Antigravity Environment",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "postCreateCommand": "npx everything-gemini install --profile developer"
}
```
