# Core Engineering Practices

- **Self-Healing Verification**: Whenever a command errors, parse the traceback before making subsequent edits.
- **Atomic Operations**: Never leave files in half-written or unparseable states.
- **Defensive Coding**: Validate all inputs at the boundary. Fail fast and fail clearly.
