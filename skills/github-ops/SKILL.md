---
name: github-ops
description: Orchestrates GitHub workflows, automated Pull Request generation, code review triage, release management, and issue automation using GitHub MCP and the gh CLI.
---

# GitHub Ops & Repository Lifecycle Automation

This skill guides the agent in managing end-to-end GitHub workflows, creating production-grade Pull Requests, performing automated multi-file code reviews, orchestrating releases, and triaging issues.

---

## 1. Operating Principles

1. **Atomic & Linear Commits**:
   - Keep Pull Requests focused on a single logical change or feature.
   - Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
2. **Deterministic Verification Before PR**:
   - Always run the local test suite and lint verification before creating or updating a PR.
   - Never push failing code or uncommitted working trees.
3. **Traceability**:
   - Every PR must link back to an issue or feature specification (`Closes #123` or `Refs #456`).
   - Every release tag must be accompanied by an auto-generated or structured changelog.

---

## 2. GitHub CLI (`gh`) & MCP Integration

When interacting with GitHub, use either the configured **GitHub MCP Server** or the standard **`gh` CLI**.

### Essential `gh` Command Patterns

| Task | Command |
| :--- | :--- |
| **Check Auth Status** | `gh auth status` |
| **Inspect Open Issues** | `gh issue list --limit 10` |
| **View Issue Details** | `gh issue view <issue-number>` |
| **Create Pull Request** | `gh pr create --title "..." --body "..."` |
| **View PR Status & Checks** | `gh pr status` / `gh pr checks` |
| **View PR Diff** | `gh pr diff <pr-number>` |
| **Add PR Comment/Review** | `gh pr review <pr-number> --comment -b "..."` |
| **Merge Pull Request** | `gh pr merge <pr-number> --squash --delete-branch` |
| **Create Release Tag** | `gh release create v1.1.0 --title "v1.1.0" --notes "..."` |

---

## 3. Pull Request Generation Workflow

When authoring a Pull Request on behalf of the user, follow this structured template:

```markdown
## 🎯 Overview
<!-- 1-2 concise sentences summarizing the problem solved or capability introduced -->

## 🛠️ Changes Implemented
- **Component / File**: High-level explanation of modification.
- **Architectural Decision**: Rationale for design choices or trade-offs.

## 🧪 Verification & Testing
- [x] Unit / Integration tests pass (`npm test`, `pytest`, or `cargo test`).
- [x] Linters and typecheckers pass (`npm run lint`, `tsc --noEmit`).
- [x] Verified zero breaking changes to existing public APIs.

## 🔗 Related Issues
Closes #<issue-number>
```

---

## 4. Automated PR Review Protocol

When performing automated reviews on a GitHub PR:

1. **Fetch & Inspect Diff**:
   ```bash
   gh pr diff <pr-number>
   ```
2. **Review Checklist**:
   - **Correctness**: Does the code satisfy the acceptance criteria without subtle edge-case failures?
   - **Security**: Are there unsanitized inputs, hardcoded secrets, or privilege escalations?
   - **Performance**: Are there N+1 database queries, unmemoized expensive loops, or memory leaks?
   - **Style & Standards**: Does it adhere to the repository's established conventions?
3. **Submitting Feedback**:
   - Use `gh pr review <pr-number> --comment` for non-blocking suggestions.
   - Use `gh pr review <pr-number> --request-changes` for critical bugs or regressions.
   - Use `gh pr review <pr-number> --approve` once all checks pass.

---

## 5. Release Automation

To publish a clean semantic release:
1. Verify `package.json` / version files are updated.
2. Ensure working tree is clean (`git status`).
3. Create and push git tag:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
4. Generate release notes with GitHub CLI:
   ```bash
   gh release create vX.Y.Z --generate-notes
   ```
