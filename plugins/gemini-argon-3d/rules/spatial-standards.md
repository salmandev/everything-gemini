# Gemini 4 Argon Spatial & 3D Standards

These guidelines define best practices for 3D web applications, Three.js scenes, and WebGPU graphics built using the `gemini-argon-3d` plugin.

## Principles
1. **Zero External Assets Where Possible**: Use procedural geometry builders, canvas noise textures, and algorithmic color palettes to provide sub-second load times.
2. **Fixed Physics Accumulator**: Decouple game logic and rigid-body simulations (Rapier.js / Cannon-es) from variable visual render intervals.
3. **Strict Memory Reclamation**: Traverse all meshes and dispose geometries, materials, and textures when scenes unmount.
4. **Visual Critique Discipline**: Inspect camera, lighting, and shadow balance systematically using multimodal perceptual loops.

