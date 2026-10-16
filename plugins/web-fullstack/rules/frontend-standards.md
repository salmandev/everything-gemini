# Frontend & Web Engineering Standards

These principles define visual quality, accessibility standards, Core Web Vitals, and modern fullstack architectures across all web applications.

---

## 1. Visual Aesthetics & Design Excellence
- **Rich Aesthetics by Default**:
  - Web applications must make a stunning first impression. Avoid plain, unstyled HTML or generic primary colors (pure red, green, blue).
  - Use curated HSL or OKLCH color palettes with harmonic tonal contrast and sleek dark-mode backgrounds (e.g. `#07090e`, `#10141f`).
- **Modern Typography**:
  - Avoid browser defaults (Times New Roman, basic Arial). Pair modern variable web fonts:
    - Interface text: *Plus Jakarta Sans*, *Inter*, or *Outfit*
    - Code / Monospace: *JetBrains Mono* or *Fira Code*
- **Dynamic Micro-Interactions**:
  - Interface elements must feel responsive and alive:
    - Hover states with subtle elevation (`transform: translateY(-2px)`)
    - Smooth transition timings (`transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`)
    - Polished button active states and copy confirmations

---

## 2. Semantic HTML5 & Accessibility (WCAG 2.2 AA)
- **Semantic Structure**:
  - Always use structural landmark elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
  - Only one `<h1>` per page, followed by logical heading hierarchy (`<h2>`, `<h3>`).
- **Interactive Elements**:
  - Never attach click handlers to unstyled `<div>` or `<span>` tags. Use `<button>` for actions and `<a>` for navigational URLs.
  - Interactive custom widgets must provide proper ARIA attributes (`aria-expanded`, `aria-label`, `aria-haspopup`).
- **Keyboard & Focus Navigation**:
  - Ensure all interactive elements are reachable via `Tab` and triggerable via `Enter` or `Space`.
  - Maintain high-visibility focus indicators (`:focus-visible`). Never suppress focus rings with `outline: none` without providing an accessible alternative.
- **Color Contrast**:
  - Maintain a minimum contrast ratio of 4.5:1 for body copy and 3:1 for large headers and graphical UI boundaries.

---

## 3. Core Web Vitals & Performance
- **Zero Cumulative Layout Shift (CLS < 0.1)**:
  - Always declare explicit `width` and `height` attributes or CSS `aspect-ratio` on `<img>`, `<video>`, and canvas elements.
  - Reserve placeholder dimensions for dynamically injected banners and async data cards.
- **Fast Largest Contentful Paint (LCP < 2.5s)**:
  - Preconnect to critical font CDNs (`<link rel="preconnect" href="https://fonts.googleapis.com">`).
  - Serve compressed next-generation image formats (WebP, AVIF) with appropriate `loading="lazy"` on below-the-fold content.
- **Interaction to Next Paint (INP < 200ms)**:
  - Debounce high-frequency events (search input fields, resize listeners).
  - Avoid heavy JavaScript calculations on the main UI thread.

---

## 4. Responsive Design & Fluid Layouts
- **Mobile-First Layout**:
  - Build responsive layouts using CSS Flexbox and modern CSS Grid (`grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`).
  - Standardized viewport breakpoints:
    - Mobile: `< 640px`
    - Tablet: `640px - 1024px`
    - Desktop: `> 1024px`
- **Fluid Typography**:
  - Scale headers smoothly between viewport sizes using CSS `clamp()`:
  ```css
  font-size: clamp(2rem, 5vw + 1rem, 3.75rem);
  ```
- **Touch-Friendly Hit Targets**:
  - Ensure touch targets on mobile viewports are at least `44x44px` with adequate margin spacing.

---

## 5. Modern Fullstack & React Server Components (RSC)
- **Server vs Client Separation**:
  - Default to React Server Components (RSC) for data fetching, static rendering, and markdown processing.
  - Restrict `'use client'` strictly to interactive leaf components requiring browser hooks (`useState`, `useEffect`, `onClick`).
- **Zero Hydration Mismatch**:
  - Never reference browser-only APIs (`window`, `localStorage`, `document`) during initial component render passes without an `isMounted` guard.
- **Resilient Error Boundaries**:
  - Wrap async route segments in React `<Suspense>` fallbacks and declarative `error.tsx` boundaries to isolate failures.
