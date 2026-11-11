---
name: agency-design-system
description: Defines scalable UI design token systems, typography scales, responsive breakpoints, accessible color contrast matrix, and component state specifications for autonomous web applications. Use when creating UI design systems, auditing contrast ratios, structuring design tokens, or building responsive component libraries.
---

# Agency Design System & Token Architecture

The `agency-design-system` skill provides a comprehensive design token and component architecture framework tailored for autonomous multi-agent development teams. It bridges the gap between `ui-ux-designer` specifications and `fullstack-developer` frontend implementations.

## Design Token Architecture

### 1. Semantic Color Palette
Never use raw hex codes directly in component code. Define semantic tokens:
- **Brand / Primary**: `--color-primary-50` through `--color-primary-900`
- **Surface & Background**:
  - `--color-bg-canvas`: Default page background (Dark: `#0d1117`, Light: `#ffffff`)
  - `--color-bg-surface`: Elevated card/panel background (Dark: `#161b22`, Light: `#f6f8fa`)
  - `--color-bg-overlay`: Modal/flyout surface (Dark: `#21262d`, Light: `#ffffff`)
- **Feedback & State**:
  - `--color-status-success`: Emerald green for pass/ready
  - `--color-status-warning`: Amber for drift/advisory
  - `--color-status-danger`: Rose red for error/veto
  - `--color-status-info`: Cyan/blue for guidance

### 2. Typography Scale
Use a modern typographic scale with relative units (`rem`):
- **Display**: `2.5rem` (40px), line-height: `1.2`, weight: `700`
- **H1**: `2.0rem` (32px), line-height: `1.25`, weight: `700`
- **H2**: `1.5rem` (24px), line-height: `1.3`, weight: `600`
- **H3**: `1.25rem` (20px), line-height: `1.4`, weight: `600`
- **Body**: `1.0rem` (16px), line-height: `1.5`, weight: `400`
- **Small / Caption**: `0.875rem` (14px), line-height: `1.4`, weight: `400`
- **Mono**: `0.875rem` (14px), font-family: `'JetBrains Mono', 'Fira Code', monospace`

### 3. Spacing Grid (4px / 8px Base)
- `space-1`: `0.25rem` (4px)
- `space-2`: `0.5rem` (8px)
- `space-3`: `0.75rem` (12px)
- `space-4`: `1.0rem` (16px)
- `space-6`: `1.5rem` (24px)
- `space-8`: `2.0rem` (32px)
- `space-12`: `3.0rem` (48px)

### 4. Responsive Breakpoints
- **Mobile**: `< 640px` (single column, full-width touch targets)
- **Tablet**: `640px - 1024px` (adaptive 2-column, collapsible navigation)
- **Desktop**: `1024px - 1440px` (standard multi-pane workspace)
- **Wide**: `> 1440px` (expanded dashboard layouts, fixed maximum content containers)

## Accessibility (WCAG 2.1 AA/AAA) Invariants

1. **Color Contrast Ratio**:
   - Normal text: Minimum $4.5:1$ contrast ratio against background ($7:1$ for AAA).
   - Large text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold): Minimum $3:1$ contrast ratio.
   - UI controls & borders: Minimum $3:1$ contrast ratio.
2. **Keyboard Focus State**:
   - Every interactive element MUST provide a visible, high-contrast `:focus-visible` ring (e.g., `outline: 2px solid var(--color-primary-400)` with `outline-offset: 2px`).
3. **Screen Reader Landmarks**:
   - Use semantic elements (`<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>`) instead of unstructured `<div>` nests.

## Component State Protocol

Every component specification delivered by `ui-ux-designer` must account for all 6 states:
| State | Visual Behavior | Accessibility Requirement |
| :--- | :--- | :--- |
| **Default** | Resting elevation, base contrast | Baseline ARIA attributes |
| **Hover** | $+5\%$ lightness or subtle shadow elevation | Non-pointer fallback |
| **Active / Pressed** | Scale $0.98$ or inset depth | Real-time tactile feedback |
| **Focus** | 2px focus ring with 2px offset | `:focus-visible` only |
| **Loading** | Pulse skeleton or spinner | `aria-busy="true"`, `aria-live="polite"` |
| **Disabled** | $50\%$ opacity, cursor not-allowed | `aria-disabled="true"`, non-focusable |
| **Error** | Danger border, helper text below | `aria-invalid="true"`, `aria-describedby` |

