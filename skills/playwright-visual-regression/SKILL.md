---
name: playwright-visual-regression
description: >-
  Implements automated visual regression testing, pixelmatch snapshot diffing, cross-browser viewport matrices, dynamic element masking, and containerized baseline stability using Playwright.
---

# Playwright Visual Regression Testing & Snapshot Diffing

This skill provides production standards for catching unintended UI regressions, CSS layout shifts, and visual anomalies across viewports using Playwright's native screenshot comparison engine.

---

## ⚡ The Golden Rules of Visual Testing

1. **Deterministic Environment**: Always generate reference snapshots inside the same containerized Linux environment (`mcr.microsoft.com/playwright`) to avoid font rendering divergence between macOS and CI runners.
2. **Mask Dynamic Elements**: Mask timestamps, avatars, animations, and non-deterministic text using Playwright's `mask` option.
3. **Wait for Font & Network Idle**: Ensure web fonts and critical API payloads are loaded before capturing snapshots.
4. **Strict Diff Thresholds**: Use `maxDiffPixelRatio: 0.01` (1% tolerance) to balance anti-aliasing tolerance against regression detection.

---

## 🏗️ Production Playwright Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      threshold: 0.2, // Pixel color sensitivity (0.0 to 1.0)
    },
  },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'Tablet iPad',
      use: { ...devices['iPad Pro 11'], viewport: { width: 834, height: 1194 } },
    },
  ],
});
```

---

## 🧪 Visual Test Implementation (`tests/visual/dashboard.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard Visual Regression Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and stabilize network
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Wait for custom web fonts to be completely rendered
    await page.evaluate(() => document.fonts.ready);
  });

  test('full dashboard page layout matches baseline', async ({ page }) => {
    // Dynamic locators that vary between test runs
    const dynamicTimestamp = page.locator('[data-testid="last-sync-time"]');
    const userAvatar = page.locator('[data-testid="user-avatar"]');

    await expect(page).toHaveScreenshot('dashboard-main-view.png', {
      fullPage: true,
      mask: [dynamicTimestamp, userAvatar],
      maskColor: '#1e293b',
    });
  });

  test('component-level snapshot for modal dialog', async ({ page }) => {
    await page.click('[data-testid="open-settings-modal"]');
    const modal = page.locator('[role="dialog"]');
    
    await expect(modal).toBeVisible();
    await expect(modal).toHaveScreenshot('settings-modal.png');
  });
});
```

---

## 🐳 Containerized Snapshot Workflow (CI Stability)

Run snapshots inside the official Playwright Docker container to prevent cross-platform font rendering diffs:

```bash
# 1. Update baseline snapshots inside Docker container
docker run --rm --network host -v $(pwd):/work/ -w /work/ \
  mcr.microsoft.com/playwright:v1.45.0-jammy \
  npx playwright test --update-snapshots

# 2. Run visual validation in CI
docker run --rm --network host -v $(pwd):/work/ -w /work/ \
  mcr.microsoft.com/playwright:v1.45.0-jammy \
  npx playwright test
```

---

## 📋 Checklist & Anti-Patterns

| Category | ❌ Anti-Pattern | ✅ Production Best Practice |
| :--- | :--- | :--- |
| **Animation** | Taking snapshots with active CSS transitions | Set `animations: 'disabled'` in config |
| **Flakiness** | Relying on `page.waitForTimeout(3000)` | Wait on `networkidle`, `document.fonts.ready`, and locator visibility |
| **Scope** | Capturing entire page for minor widget changes | Use element locators: `expect(locator).toHaveScreenshot()` |
| **OS Mismatch** | Committing macOS snapshots to run in Ubuntu CI | Generate reference snapshots with Docker container |
