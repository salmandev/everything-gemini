# Everything Gemini (everything-gemini) v3.2.0 Launch Kit
## Gemini Game Studios & Gemini 4 Argon 3D Suite (150 Production Components)

---

### 📦 Release Metadata
- **Release Version**: `v3.2.0`
- **Release Codename**: *Gemini Game Studios & Argon Spatial Engine*
- **Git Commit / Tag**: `v3.2.0`
- **Total Production Components**: **150** (115 Progressive Skills, 22 Scoped Subagents, 13 Lifecycle Hooks, 6 Curated Plugins)
- **Primary Milestones**:
  1. **Autonomous Gemini Game Studios (`game-studio`)**:
     - Complete virtual game development studio pipeline mirroring professional studio tracks (Creative, Engineering, Art & World, Audio, QA).
     - 22nd Scoped Subagent: [`agents/game-director.md`](../agents/game-director.md) overseeing creative vision, standardized GDDs, sprint milestones, and gold master release gates.
     - Progressive Skills: [`game-studio`](../skills/game-studio/SKILL.md) and [`game-audio-synthesizer`](../skills/game-audio-synthesizer/SKILL.md) (pure Web Audio API procedural SFX & dynamic ambient music).
     - CLI Command: `everything-gemini game-studio [gdd|plan|audit|init]`.
  2. **Gemini 4 Argon 3D & Spatial Engine**:
     - Harnesses Gemini 4 Argon's spatial reasoning, procedural mesh generation, and multi-turn visual critique loops.
     - 21st Scoped Subagent: [`agents/spatial-game-architect.md`](../agents/spatial-game-architect.md).
  3. **Core 3D Skills Suite**:
     - [`argon-3d-scene-architect`](../skills/argon-3d-scene-architect/SKILL.md): Three.js/WebGPU scene graphs, ACESFilmic, DPR clamping, and post-processing (UnrealBloom, SSAO).
     - [`argon-3d-game-engine`](../skills/argon-3d-game-engine/SKILL.md): Decoupled fixed-timestep physics (60Hz accumulator) with Rapier/Cannon, kinematic player controllers, and follow cameras.
     - [`argon-procedural-asset-generator`](../skills/argon-procedural-asset-generator/SKILL.md): Algorithmic low-poly meshes, vertex-color elevation terrain, canvas textures, and `InstancedMesh` scattering.
     - [`argon-visual-critique-loop`](../skills/argon-visual-critique-loop/SKILL.md): Automated canvas snapshot perceptual auditing across 6 spatial dimensions.
  4. **New Plugin**: [`plugins/gemini-argon-3d/`](../plugins/gemini-argon-3d/) featuring [`argon-webgpu-pbr`](../plugins/gemini-argon-3d/skills/argon-webgpu-pbr/SKILL.md) for Three.js Shading Language (TSL) node materials.
  5. **Spatial Rules**: [`rules/paradigms/argon-3d-spatial.md`](../rules/paradigms/argon-3d-spatial.md) enforcing 60 FPS budgets, zero memory leaks, and context-loss recovery.

---

## 🚀 Publish & Release Runbook

### Step 1: Run Full Test Suite
```bash
npm test
```

### Step 2: Commit & Push to GitHub
```bash
git add .
git commit -m "feat(argon-3d): release v3.2.0 with Gemini 4 Argon 3D Games Suite"
git tag -a v3.2.0 -m "Release v3.2.0: Gemini 4 Argon 3D Games & Spatial Suite (147 Components)"
git push origin main --tags
```

### Step 3: Publish to npm
```bash
# Check logged-in npm user
npm whoami

# Publish package
npm publish --access public
```

---

## 📱 Social Media Copy & Launch Templates

### 1. LinkedIn Post

**Title**: 🪐 Announcing Everything Gemini v3.2.0: Gemini 4 Argon 3D Games, Three.js & Spatial Computing Suite

```markdown
🚀 Build 3D browser games and spatial web apps with AI that actually understands 3D geometry.

Today, we're releasing Everything Gemini (everything-gemini) v3.2.0 — expanding the harness to 147 battle-tested components with the brand-new Gemini 4 Argon 3D Games & Spatial Suite.

Gemini 4 Argon’s spatial reasoning and visual coding are game-changers for the web. But creating production-grade 3D games in the browser requires strict guardrails:
❌ High-DPI screens can decimate GPU fill rates.
❌ Variable requestAnimationFrame steps cause physics tunneling and glitches.
❌ Uncollected WebGL textures cause silent GPU memory leaks and crashes.

v3.2.0 solves this completely:

🎮 Spatial Game Architect (21st Scoped Subagent):
A dedicated subagent specializing in Three.js, WebGPU, and Rapier/Cannon physics.

⛰️ Procedural Asset Generation:
Bake procedural terrains with vertex colors, low-poly vehicles, and canvas textures on the fly. Scatter 10,000+ objects with a single draw call using InstancedMesh — zero multi-megabyte model downloads needed!

⏱️ Decoupled Physics Loop:
Fixed 60Hz physics accumulator decoupled from rendering to ensure deterministic physics stability.

🔄 Visual Critique Loop:
Argon's signature capability: renders canvas snapshots, audits lighting contrast, shadow acne, clipping, and camera FOV, and autonomously refines code until it's publication-ready.

Install or upgrade instantly:
👉 npx everything-gemini install
👉 GitHub: https://github.com/salmandev/everything-gemini

#AI #Gemini #Antigravity #ThreeJS #WebGPU #GameDev #WebDev #OpenSource
```

### 2. X / Twitter Thread

```markdown
1/6 🪐 Announcing Everything Gemini v3.2.0!

We're bringing Google Gemini 4 Argon's frontier spatial reasoning to browser game development with our new 3D Games & Spatial Suite (147 total components). 🧵👇

2/6 🕹️ Meet `spatial-game-architect`:
Our 21st scoped subagent dedicated to Three.js, WebGPU, and Rapier physics. It enforces a strict 60 FPS frame budget and zero-memory-leak WebGL lifecycle teardowns.

3/6 🌲 Zero-Download Procedural Assets:
Why download 50MB of 3D models?
`argon-procedural-asset-generator` synthesizes elevation-colored terrain, low-poly props, and canvas textures on the fly, rendering 10k+ instances in a single draw call.

4/6 🏎️ Stable Physics Game Loops:
`argon-3d-game-engine` decouples the fixed 60Hz physics accumulator from variable rAF rendering. No more physics tunneling or glitching through walls.

5/6 👁️ Visual Critique Loop:
Argon renders snapshots, inspects shadow acne, camera FOV, and PBR roughness via multimodal vision, and applies surgical self-correcting patches.

6/6 Upgrade or test drive today:
npx everything-gemini install --profile developer

⭐ Star us on GitHub: https://github.com/salmandev/everything-gemini
```

### 3. Reddit (r/webdev, r/threejs, r/gamedev)

**Title**: Everything Gemini v3.2.0: Harnessing Gemini 4 Argon for Procedural 3D Web Games & Three.js

```markdown
Hey everyone! We just released v3.2.0 of `everything-gemini` (an open-source harness and multi-agent suite for Google Gemini and Antigravity).

This release introduces the **Gemini 4 Argon 3D & Spatial Computing Suite** designed specifically for Three.js, WebGPU, and browser game development:

Key additions:
- **spatial-game-architect subagent**: Enforces 60 FPS budgets, DPR clamping, and clean WebGL disposal.
- **Fixed-timestep loop**: Decouples 60Hz Rapier/Cannon physics updates from variable requestAnimationFrame ticks.
- **Procedural Asset Pipeline**: Generates low-poly vehicles, vertex-colored terrain, and procedural canvas textures in-memory without external GLTF downloads.
- **Autonomous Visual Critique**: Generates canvas snapshots, audits lighting/shadows/clipping using vision, and iterates automatically.

Check it out on GitHub: https://github.com/salmandev/everything-gemini
Feedback and contributions are welcome!
```

