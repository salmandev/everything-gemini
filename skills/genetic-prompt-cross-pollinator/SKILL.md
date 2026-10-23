---
name: genetic-prompt-cross-pollinator
description: Optimizes agent prompt surfaces and subagent contracts through multi-generation tournament selection, genetic crossover, and Pareto-frontier fitness evaluation.
---

# Genetic Prompt Cross-Pollinator (`genetic-prompt-cross-pollinator`)

Implements Harness³ autonomous agentic Darwinism: applying evolutionary algorithms, multi-generation tournament selection, genetic crossover of prompt surfaces, and Pareto-frontier fitness evaluation to recursively discover optimal agent prompts without altering base model weights.

---

## 1. Evolutionary Architecture: Genetic Prompt Recombination

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 GENETIC PROMPT CROSS-POLLINATION PIPELINE                   │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. Seed Population Generation ($N=8$ Harness Candidates)            │   │
│   │    • Baseline prompts from `.agents/`, `rules/`, and `skills/`      │   │
│   │    • Stochastic prompt perturbations across 8 harness surfaces      │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 2. Tournament Selection ($K=3$ Candidates per Bracket)              │   │
│   │    • Multi-task probe evaluation on local test suite                │   │
│   │    • Fitness function: $F = \frac{\text{PassRate} \times \text{Resilience}}{\text{Tokens} \times \text{Latency}}$ │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 3. Genetic Crossover & Semantic Recombination                       │   │
│   │    ┌───────────────────────────┐     ┌──────────────────────────┐   │   │
│   │    │ Parent A: High Accuracy   │     │ Parent B: Low Token Burn │   │   │
│   │    │ (Deep reasoning guidance) │     │ (Concise AST formatting) │   │   │
│   │    └─────────────┬─────────────┘     └────────────┬─────────────┘   │   │
│   └──────────────────┼────────────────────────────────┼─────────────────┘   │
│                      └────────────────┬───────────────┘                     │
│                                       ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 4. Mutation & Adversarial Validation                                │   │
│   │    • Mutation Rate: $P_m = 0.15$ (Synonym swap, bullet compaction)  │   │
│   │    • Adversarial fuzz verification against prompt regression probes │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 5. Pareto Frontier Composition & Master Deployment                  │   │
│   │    • Selects non-dominated solutions balancing cost vs accuracy     │   │
│   │    • Commits winning harness phenotype to `.agents/` repository     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Mathematical Formalism

### A. Multi-Objective Fitness Metric ($F$)
Every candidate harness configuration $h_i$ is evaluated against an empirical test suite:
$$F(h_i) = w_1 \cdot \text{Accuracy}(h_i) + w_2 \cdot \text{Resilience}(h_i) - w_3 \cdot \log(\text{Tokens}(h_i)) - w_4 \cdot \text{Latency}(h_i)$$

Where:
- $\text{Accuracy} \in [0, 1]$: Unit and integration test pass percentage.
- $\text{Resilience} \in [0, 1]$: Survival rate under fault injection (Harness³ mutation testing).
- $\text{Tokens}$: Cumulative prompt and output token consumption.
- Weights $w = [0.45, 0.35, 0.10, 0.10]$ prioritizing correctness and stability.

### B. Genetic Operators
1. **Uniform Crossover**: Selects prompt sections (role instructions, tool guidelines, format envelopes) randomly from winning parent pairs.
2. **Point Mutation**: Mutates prompt temperature, thinking token caps, and few-shot examples.
3. **Elitism**: Top 10% highest-scoring harnesses pass unaltered into the next generation.

---

## 3. Operational Recipes

### Running Genetic Evolution via CLI
```bash
# Evolve prompt surfaces across 5 generations with tournament selection
everything-gemini genetic evolve --generations 5 --population 8 --max-usd 2.50

# Inspect Pareto frontier trade-offs between cost and accuracy
everything-gemini genetic pareto --workspace .
```

### Python SDK Integration Blueprint
```python
from google_antigravity.darwin import GeneticPromptOptimizer

optimizer = GeneticPromptOptimizer(
    target_skill="skills/cross-repo-swarm-sync/SKILL.md",
    population_size=8,
    generations=4,
    tournament_k=3,
    model="gemini-3.8-thinking"
)

winning_harness = optimizer.run_evolution()
print(f"Optimal Fitness Score: {winning_harness.fitness_score:.4f}")
winning_harness.commit_to_workspace()
```

---

## 4. Cross-Reference Links
- See [skills/harness3-mutation-testing/SKILL.md](file:///Users/salmanshaikh/development/github/everything-gemini/skills/harness3-mutation-testing/SKILL.md) for adversarial fault injection.
- See [agents/darwin-prompt-engineer.md](file:///Users/salmanshaikh/development/github/everything-gemini/agents/darwin-prompt-engineer.md) for evolutionary subagent operations.
- See [ROADMAP_AGI_v3.0.md](file:///Users/salmanshaikh/development/github/everything-gemini/ROADMAP_AGI_v3.0.md) for the Harness³ Darwinian roadmap.
