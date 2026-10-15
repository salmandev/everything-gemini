# Everything Gemini (everything-gemini) Repository Guidelines

When contributing to or modifying the `everything-gemini` repository:

1. **Dogfooding Antigravity & everything-gemini**:
   - Adhere strictly to Antigravity's progressive disclosure principles.
   - All new skills must include YAML frontmatter (`name`, `description` in third person).
   - All hook scripts must receive protojson on stdin and output valid JSON on stdout.

2. **Validation**:
   - Run `npm test` or `bash scripts/validate.sh` before finalizing any changes.
   - Ensure all shell scripts are executable (`chmod +x`).

3. **Documentation**:
   - Keep markdown documentation up-to-date and maintain clickable `file://` links for local files.
