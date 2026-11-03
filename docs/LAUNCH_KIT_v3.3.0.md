# Everything Gemini (everything-gemini) v3.3.0 Launch Kit
## Gemini Game Studios: Autonomous Multi-Agent Game Production (150 Production Components)

---

### 📦 Release Metadata
- **Release Version**: `v3.3.0`
- **Release Codename**: *Gemini Game Studios & Virtual Production Engine*
- **Git Commit / Tag**: `v3.3.0`
- **Total Production Components**: **150** (115 Progressive Skills, 22 Scoped Subagents, 13 Lifecycle Hooks, 6 Curated Plugins)
- **Primary Milestones**:
  1. **Autonomous Gemini Game Studios (`game-studio`)**:
     - Complete virtual game development studio pipeline mirroring professional studio tracks (Creative, Engineering, Art & World, Audio, QA).
     - 22nd Scoped Subagent: [`agents/game-director.md`](../agents/game-director.md) overseeing creative vision, standardized GDDs, sprint milestones, and gold master release gates.
     - Progressive Skills: [`game-studio`](../skills/game-studio/SKILL.md) and [`game-audio-synthesizer`](../skills/game-audio-synthesizer/SKILL.md) (pure Web Audio API procedural SFX & dynamic ambient music).
     - CLI Command: `everything-gemini game-studio [gdd|plan|audit|init]`.
  2. **Gemini 4 Argon 3D & Spatial Engine Integration**:
     - 21st Scoped Subagent: [`agents/spatial-game-architect.md`](../agents/spatial-game-architect.md).
     - Skills: [`argon-3d-scene-architect`](../skills/argon-3d-scene-architect/SKILL.md), [`argon-3d-game-engine`](../skills/argon-3d-game-engine/SKILL.md), [`argon-procedural-asset-generator`](../skills/argon-procedural-asset-generator/SKILL.md), [`argon-visual-critique-loop`](../skills/argon-visual-critique-loop/SKILL.md).
  3. **New Plugin**: [`plugins/gemini-argon-3d/`](../plugins/gemini-argon-3d/) featuring [`argon-webgpu-pbr`](../plugins/gemini-argon-3d/skills/argon-webgpu-pbr/SKILL.md).
  4. **Spatial Rules**: [`rules/paradigms/argon-3d-spatial.md`](../rules/paradigms/argon-3d-spatial.md) enforcing 60 FPS budgets, zero memory leaks, and context-loss recovery.

---

## 🚀 Publish & Release Runbook

### Step 1: Run Full Test Suite
```bash
npm test
```

### Step 2: Commit & Push to GitHub
```bash
git add .
git commit -m "feat(game-studio): release v3.3.0 with Gemini Game Studios (150 Components)"
git tag -a v3.3.0 -m "Release v3.3.0: Gemini Game Studios (150 Components)"
git push origin main --tags
```

### Step 3: Publish to npm
```bash
# Verify authentication
npm whoami

# Publish package
npm publish --access public
```

---

## 📱 Social Media Copy & Launch Templates

### 1. LinkedIn Post

**Title**: 🪐 Announcing Everything Gemini v3.3.0: Autonomous Multi-Agent Game Studios (150 Components)

```markdown
🚀 What if an entire game studio could live inside your coding agent?

Today, we're releasing Everything Gemini (everything-gemini) v3.3.0 — reaching a landmark 150 production components with the debut of Gemini Game Studios (`game-studio`).

Inspired by projects like Claude-Code-Game-Studios and powered by Gemini 4 Argon's 3D spatial reasoning, v3.3.0 brings a complete, disciplined virtual game development pipeline to Google Antigravity:

👑 Game Director (22nd Scoped Subagent):
Oversees creative vision, standardizes Game Design Documents (GDD), coordinates department sprints, and certifies gold master releases.

💻 Spatial Game Architect (21st Scoped Subagent):
Constructs Three.js / WebGPU scene graphs, ACESFilmic tone mapping, and decoupled 60Hz physics loops.

🎵 Game Audio Synthesizer:
Zero-download procedural sound design using pure Web Audio API. Synthesizes jump sweeps, laser bursts, explosions, coin pickup chimes, and dynamic ambient music directly in memory.

🌲 Procedural World Synthesis:
Bakes elevation-colored terrain, low-poly assets, and procedural textures on the fly. Renders 10,000+ instances in a single draw call with InstancedMesh.

👁️ Visual Critique Loop:
Audits canvas snapshots across 6 spatial dimensions (camera FOV, lighting contrast, shadow acne, clipping) and applies precision patches autonomously.

Install or upgrade:
👉 npx everything-gemini install
👉 GitHub: https://github.com/salmandev/everything-gemini

#GameDev #AI #Gemini #ThreeJS #WebGPU #IndieGameDev #OpenSource
```

### 2. X / Twitter Thread

```markdown
1/5 🪐 Announcing Everything Gemini v3.3.0!

We're bringing autonomous game studio pipelines to Google Antigravity & Gemini with Gemini Game Studios (`game-studio`), reaching a landmark 150 components! 🧵👇

2/5 👑 Meet `game-director`:
Our 22nd scoped subagent acts as executive director and producer. It writes structured GDDs, plans milestone sprints, and enforces 60 FPS performance gates.

3/5 🎵 Zero-Download Audio:
`game-audio-synthesizer` creates jump sounds, laser blasts, coin pickups, and ambient soundtracks using pure Web Audio API code — no external audio files needed!

4/5 🎮 Terminal Studio CLI:
• `everything-gemini game-studio gdd <title>` (Draft GDD)
• `everything-gemini game-studio plan <title>` (Sprint Plan)
• `everything-gemini game-studio audit` (60 FPS & Memory Check)

5/5 Upgrade or install today:
npx everything-gemini install

⭐ Star us on GitHub: https://github.com/salmandev/everything-gemini
```
