---
name: git-craftsman
description: >-
  Guides atomic commits, conventional commit formatting, clean branch strategies, and pull request walkthrough generation. Use when staging, committing, or preparing a PR.
---

# Git Craftsman

This skill enforces clean version control habits, atomic commits, and structured pull request walkthroughs.

## Atomic Commit Workflow

### 1. Inspect Staged & Unstaged Diff
Always review changes before staging:
```bash
git status -s
git diff
```

### 2. Craft Conventional Commit Messages
Format commit messages strictly following the Conventional Commits specification:
```text
<type>(<scope>): <short imperative summary>

[optional detailed body explaining WHY, not just WHAT]

[optional breaking changes or issue references]
```

**Permitted Types**:
- `feat`: New feature or user-facing functionality.
- `fix`: Bug fix.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: Performance improvement.
- `test`: Adding or correcting tests.
- `docs`: Documentation only changes.
- `chore`: Build system, configuration, or dependency updates.

### 3. Pull Request Walkthrough Format
When authoring a pull request summary, include:
- **High-Level Objective**: What problem this PR solves.
- **Key Changes**: Bulleted list of modified modules with clickable file links.
- **Verification Performed**: Exact commands run (`npm test`, `cargo test`) and results.
