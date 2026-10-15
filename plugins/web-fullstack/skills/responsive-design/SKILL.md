---
name: responsive-design
description: >-
  Guides creating mobile-responsive layouts, fluid typography, flex/grid structures, and cross-browser testing. Use when designing or debugging responsive user interfaces.
---

# Responsive Design & Layout Engineering

This skill structures the creation of responsive, cross-device interfaces.

## Guidelines

1. **Mobile-First CSS**: Define baseline mobile styles without media queries, then use `min-width` queries for larger viewports:
   ```css
   .container { width: 100%; padding: 1rem; }
   @media (min-width: 768px) { .container { max-width: 720px; } }
   @media (min-width: 1024px) { .container { max-width: 960px; } }
   ```
2. **Fluid Typography**: Use `clamp()` for headings that adapt gracefully between screen sizes:
   ```css
   font-size: clamp(1.5rem, 2.5vw + 1rem, 3rem);
   ```
3. **Verify with Browser Subagent**: Use `browser_subagent` to resize the browser window across standard breakpoints (375px mobile, 768px tablet, 1440px desktop) and confirm that navigation drawers and flex wraps behave cleanly.
