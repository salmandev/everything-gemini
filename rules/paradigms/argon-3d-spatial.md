# Argon 3D & Spatial Computing Engineering Rules

These rules govern all 3D web applications, Three.js scenes, WebGPU shaders, and browser game development in `everything-gemini`.

---

## 1. Frame Budget & GPU Invariants

- **60 FPS Standard**: Target frame duration is $\le 16.6\text{ms}$. Never allow unthrottled render loops or synchronous heavy calculations on the main thread.
- **DPR Clamping**: Always clamp device pixel ratio with `Math.min(window.devicePixelRatio, 2)`. Never pass raw `window.devicePixelRatio` to renderers on high-DPI (Retina/4K) screens.
- **Draw Call Ceilings**: Maintain $< 100$ draw calls per frame for general scenes, and $< 30$ for mobile targets. Repeated geometry MUST use `THREE.InstancedMesh` or `THREE.BatchedMesh`.
- **Polygon & Vertex Caps**: Maximum 200,000 active polygons per scene on desktop, and 60,000 on mobile targets unless dynamic LOD (Level of Detail) is enabled.

---

## 2. Memory Hygiene & WebGL Lifecycle

- **Recursive Disposal**: Every Three.js component, level unmount, or canvas teardown MUST recursively traverse the scene graph and call `.dispose()` on:
  - `geometry.dispose()`
  - `material.dispose()` (and loop over material arrays if multi-material)
  - `texture.dispose()` on map, normalMap, roughnessMap, and envMap
  - `renderTarget.dispose()` on custom FBOs and EffectComposer passes
- **Context Loss Handling**: All WebGL renderers MUST register event listeners for `webglcontextlost` (calling `event.preventDefault()`) and `webglcontextrestored` to prevent silent crashes.

---

## 3. Physics & Loop Decoupling

- **Decoupled Physics**: NEVER step physics with variable `deltaTime` directly inside `requestAnimationFrame`. Always use a fixed-timestep sub-accumulator loop (e.g. 60Hz / $16.6\text{ms}$) to guarantee numerical stability and collision reproducibility.
- **Raycast Throttling**: Never run mouse raycasting every pixel move without debouncing or throttling to render tick intervals.

---

## 4. Lighting & Visual Composition

- **Color Space Fidelity**: Set `renderer.outputColorSpace = THREE.SRGBColorSpace` and configure `renderer.toneMapping = THREE.ACESFilmicToneMapping` with `toneMappingExposure` calibrated between $0.9$ and $1.2$.
- **Shadow Map Sizing**: Directional shadow maps should not exceed $2048 \times 2048$. Tighten shadow camera frustum bounds to avoid wasteful texel allocation.
- **Atmospheric Backgrounds**: Avoid raw `#000000` pitch black backgrounds. Provide contextual fog (`THREE.FogExp2`) and a matching horizon clear color for spatial depth.

