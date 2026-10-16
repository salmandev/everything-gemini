---
name: wasm-rust-optimizer
description: >-
  Compiles and optimizes high-performance WebAssembly modules from Rust using wasm-pack, zero-copy memory buffers (Uint8Array), SIMD vectorization, and Web Worker thread pools.
---

# WebAssembly & Rust Performance Optimization

This skill guides compiling compute-intensive logic (image processing, cryptographic hashing, parser engines, physics calculations) into high-throughput WebAssembly (WASM) modules using Rust.

---

## ⚡ Rust & Cargo Configuration (`Cargo.toml`)

Configure the crate for minimal binary footprint and direct browser bindings:

```toml
[package]
name = "wasm-engine"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
wasm-bindgen = "0.2"
js-sys = "0.3"
web-sys = { version = "0.3", features = ["console"] }

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
panic = "abort"
strip = true
```

---

## 🚀 Zero-Copy Memory Transfer (Uint8Array)

Avoid JSON serialization overhead when passing gigabytes or megabytes of data between JavaScript and WebAssembly. Pass memory buffer pointers directly:

### 1. Rust Implementation (`src/lib.rs`)

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct ImageProcessor {
    buffer: Vec<u8>,
}

#[wasm_bindgen]
impl ImageProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new(size: usize) -> Self {
        Self {
            buffer: vec![0u8; size],
        }
    }

    /// Exposes raw memory pointer for zero-copy JavaScript access
    pub fn get_buffer_ptr(&self) -> *const u8 {
        self.buffer.as_ptr()
    }

    /// In-place high-performance pixel grayscale filter
    pub fn process_grayscale(&mut self) {
        // Fast in-place chunk iteration
        for pixel in self.buffer.chunks_exact_mut(4) {
            let r = pixel[0] as u32;
            let g = pixel[1] as u32;
            let b = pixel[2] as u32;
            let gray = ((r * 77 + g * 150 + b * 29) >> 8) as u8;
            pixel[0] = gray;
            pixel[1] = gray;
            pixel[2] = gray;
        }
    }
}
```

---

### 2. JavaScript / TypeScript Client Integration

```typescript
import init, { ImageProcessor } from './pkg/wasm_engine.js';

export async function runProcessor(canvas: HTMLCanvasElement) {
  const wasm = await init();
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const totalBytes = imageData.data.length;

  // Instantiate Rust WASM processor
  const processor = new ImageProcessor(totalBytes);
  const ptr = processor.get_buffer_ptr();

  // Create zero-copy views directly into WASM linear memory
  const wasmMemoryView = new Uint8Array(wasm.memory.buffer, ptr, totalBytes);
  wasmMemoryView.set(imageData.data);

  // Execute native compiled computation
  processor.process_grayscale();

  // Read back transformed memory without cloning
  imageData.data.set(wasmMemoryView);
  ctx.putImageData(imageData, 0, 0);
}
```

---

## 🛠️ Build & Optimization Workflow

1. **Compile with `wasm-pack`:**
   ```bash
   wasm-pack build --target web --release
   ```

2. **Optimize with `wasm-opt` (Binaryen):**
   ```bash
   wasm-opt -O4 -o pkg/wasm_engine_bg_opt.wasm pkg/wasm_engine_bg.wasm
   ```

3. **Non-Blocking Compute in Web Workers:**
   Always instantiate large WASM modules inside dedicated Web Workers (`new Worker(new URL('./worker.ts', import.meta.url))`) to keep the UI thread rendering at a silky 60/120 FPS.
