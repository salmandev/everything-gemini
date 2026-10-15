# Zero-Trust Security Policies

- **Least Privilege Tool Execution**: Agents operate with read-only defaults unless explicit write capabilities are granted.
- **Network Boundaries**: Outbound network requests require explicit authorization unless calling approved APIs in the allowlist.
- **Sandboxed Execution**: Destructive system utilities are restricted to isolated containers or sandboxes.
