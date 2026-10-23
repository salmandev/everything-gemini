---
name: adversarial-fuzz-generator
description: Synthesizes property-based adversarial test suites, grammar-guided fuzz payloads, and edge-case invariants to mathematically verify agent harnesses before deployment.
---

# Adversarial Fuzz Generator & Property-Based Validator (`adversarial-fuzz-generator`)

Autonomously synthesizes grammar-guided property-based test suites, fuzz injection vectors, and boundary condition invariants to expose prompt regressions, tool schema vulnerabilities, and logic flaws in autonomous agent harnesses before production rollout.

---

## 1. Architectural Pipeline: Grammar-Guided Adversarial Fuzzing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 ADVERSARIAL FUZZ SYNTHESIS & VALIDATION PIPELINE            │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. Schema & Invariant Extraction                                    │   │
│   │    • Inspects tool signatures, Pydantic/Zod schemas, and hooks      │   │
│   │    • Extracts formal boundary invariants (ranges, regex, types)     │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 2. Grammar-Guided Fuzz Payload Generator                            │   │
│   │    ┌───────────────────────────┐     ┌──────────────────────────┐   │   │
│   │    │ A. Structural Fuzzing     │     │ B. Adversarial Injections│   │   │
│   │    │ • Malformed Unicode / BOM │     │ • System override bypass │   │   │
│   │    │ • Integer max/min wraps   │     │ • Command evasion tokens │   │   │
│   │    │ • Deep recursive JSON     │     │ • Infinite retry loops   │   │   │
│   │    └─────────────┬─────────────┘     └────────────┬─────────────┘   │   │
│   └──────────────────┼────────────────────────────────┼─────────────────┘   │
│                      └────────────────┬───────────────┘                     │
│                                       ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 3. Isolated Micro-VM Execution & Exception Triage                   │   │
│   │    • Runs candidate harness against 1,000 generated fuzz vectors    │   │
│   │    • Catches unhandled exceptions, infinite loops, and silent drops │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 4. Autonomous Property-Based Regression Synthesis                   │   │
│   │    • Synthesizes discovered edge cases into permanent unit tests    │   │
│   │    • Emits Hypotheses / fast-check suites to `tests/fuzz/`          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Fuzzing Methodologies & Payloads

### A. Boundary Value Perturbation
- **Numeric Fields**: $-2^{63}$, $2^{63}-1$, $0$, $-1$, `NaN`, `Infinity`, `1e308`.
- **String Fields**: Overlong strings ($>1\text{MB}$), zero-width spaces (`\u200B`), right-to-left overrides (`\u202E`), unpaired UTF-16 surrogates (`\uD800`).
- **File System**: Relative traversal path injections (`../../../../etc/passwd`), null bytes (`%00`), symlink loops.

### B. Property-Based Invariant Verification
Verifies that for all valid inputs $X$, the agent's tool execution satisfies safety invariants:
$$\forall x \in X: \quad \text{ToolExecution}(x) \in \{\text{Allowed}, \text{DeniedByPolicy}\} \quad \land \quad \text{ExitCode}(x) \neq \text{CRASH}$$

---

## 3. Operational Recipes

### Generating Adversarial Fuzz Tests via CLI
```bash
# Run grammar-guided fuzz scan on active workspace tool definitions
everything-gemini resilience inject --faults "fuzz_payload,unicode_drift" --iterations 50

# Inspect fuzz invariants
everything-gemini audit --json | jq .fuzzValidation
```

### Python Property Test Generation
```python
from hypothesis import given, strategies as st
from google_antigravity.testing import HarnessFuzzSuite

class TestToolFuzzInvariants(HarnessFuzzSuite):
    @given(st.text(min_size=0, max_size=5000))
    def test_tool_payload_sanitization(self, payload):
        result = self.execute_pre_tool_hook({"tool": "write_to_file", "input": payload})
        assert result.decision in ["allow", "deny"]
        assert not result.has_crashed
```

---

## 4. Cross-Reference Links
- See [skills/harness3-mutation-testing/SKILL.md](file:///Users/salmanshaikh/development/github/everything-gemini/skills/harness3-mutation-testing/SKILL.md) for mutation test scoring.
- See [hooks/fuzz-sentinel/hooks.json](file:///Users/salmanshaikh/development/github/everything-gemini/hooks/fuzz-sentinel/hooks.json) for deterministic fuzz gating.
- See [agents/resilience-engineer.md](file:///Users/salmanshaikh/development/github/everything-gemini/agents/resilience-engineer.md) for chaos testing protocols.
