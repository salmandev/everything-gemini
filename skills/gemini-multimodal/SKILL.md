---
name: gemini-multimodal
description: >-
  Use this skill when analyzing visual mockups, inspecting UI screenshots, converting wireframes to frontend code, extracting architecture from diagrams, or performing visual QA regression checks using Gemini's native multimodal capabilities.
---

# Gemini Multimodal Engineering

## Overview
Gemini 1.5/3.8 models feature native multimodal grounding across images, diagrams, video frames, and audio tokens. This skill guides the agent on how to effectively extract structured specifications from visual assets and translate them into production code.

## Procedural Workflow

### 1. Visual Intake & Pre-Processing
- **Aspect Ratio & Resolution**: Gemini processes visual inputs with native resolution preservation.
- **Reference Assets**: When inspecting diagrams or UI mockups, identify layout hierarchy:
  - Header / Navigation bars
  - Main grid or flex container arrangements
  - Typography weights, line heights, and color hex values
  - Interactive elements (buttons, inputs, carousels, modals)

### 2. Mockup-to-Code Translation Pattern
When converting a visual mockup into web components:
1. **Layout First**: Implement semantic HTML scaffolding matching visual hierarchy.
2. **Design Tokens**: Extract exact color palettes, border radiuses, and shadow elevations into CSS variables.
3. **Responsive Breakpoints**: Infer desktop, tablet, and mobile reflow logic from the visual layout.
4. **Interactive States**: Emulate hover, focus-visible, and active states visible in the UI.

### 3. Diagram & Flowchart Extraction
When given an architectural whiteboard photo or flowchart:
1. Transcribe nodes and connections into clean **Mermaid.js** diagrams.
2. Extract data models, sequence flows, and component boundaries into typed interfaces.

### 4. Visual QA & Regression Diffing
1. Capture screenshots of the rendered application using `browser_subagent`.
2. Inspect layout anomalies: overlapping text, clipped containers, misalignment across viewports.
3. Apply surgical CSS adjustments without affecting sibling components.

## Verification Checklist
- [ ] Visual hierarchy precisely reflects the reference asset
- [ ] No placeholder assets or mock text left in production components
- [ ] CSS uses fluid units (`rem`, `ch`, `%`) and CSS grid/flexbox
- [ ] Visual artifacts verified via browser inspection or recording
