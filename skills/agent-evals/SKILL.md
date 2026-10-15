---
name: agent-evals
description: Designs, executes, and benchmarks AI agent evaluation pipelines, LLM-as-a-judge scoring rubrics, golden test datasets, and prompt regression testing harnesses.
---

# Agent Evals & LLM Benchmark Playbook

This skill guides the creation of automated evaluation harnesses, LLM-as-a-judge scoring pipelines, and regression testing suites for AI agents and LLM applications.

---

## 1. Core Principles

1. **Deterministic Assertions First**:
   - Prefer deterministic, unit-testable assertions (schema validation, regex matching, exit codes, latency limits) before falling back to subjective LLM judges.
2. **Golden Datasets with Ground Truth**:
   - Maintain versioned golden evaluation datasets (`evals/golden.jsonl`) pairing input prompts with expected outputs or behavioral criteria.
3. **Regression Containment**:
   - Any prompt revision or model switch must run against the baseline eval suite to measure accuracy deltas, token consumption, and latency shifts.

---

## 2. Evaluation Dimensions

When assessing agent output quality, evaluate across four standardized vectors:

| Dimension | Metric | Measurement Method |
| :--- | :--- | :--- |
| **Accuracy / Correctness** | Factual precision, task fulfillment | LLM-as-a-judge with binary pass/fail rubric |
| **Safety & Alignment** | Injection vulnerability, secret leakage | Automated static analysis & safety classifiers |
| **Schema Compliance** | Valid JSON, Pydantic type conformance | Deterministic parser validation (`json.loads`, Pydantic) |
| **Context Economics** | Token count, time-to-first-token (TTFT) | Profiler logs & Gemini metadata tokens |

---

## 3. LLM-as-a-Judge Scoring Template

When using Gemini as an automated evaluator, structure the prompt with strict zero-shot rubrics and JSON output:

```python
EVAL_SYSTEM_PROMPT = """You are an impartial, expert evaluation judge. 
Assess the candidate agent response against the provided Reference Criteria.
Provide a structured JSON evaluation adhering to the schema:
{
  "score": <float 0.0 to 1.0>,
  "reasoning": "<concise explanation of strengths and shortcomings>",
  "violations": ["<list of any missed constraints>"]
}
Only output valid JSON.
"""
```

---

## 4. Eval Runner Execution Flow

1. **Load Test Suite**: Ingest test cases from `evals/test_cases.jsonl`.
2. **Execute Candidate Prompt**: Query the model with temperature=0.0 for reproducible benchmarking.
3. **Run Deterministic Checks**: Validate JSON schema, required keys, and formatting constraints.
4. **Run LLM Judge**: Pass model output + reference criteria to the evaluator.
5. **Aggregate Metrics**: Calculate overall pass rate, p95 latency, and token cost per run.
