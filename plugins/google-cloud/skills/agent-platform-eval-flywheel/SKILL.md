---
name: agent-platform-eval-flywheel
description: Orchestrates continuous evaluation, Golden Dataset curation, metric tracking (BLEU, ROUGE, LLM-as-a-judge), and regression detection for Gemini agents using Google Cloud Agent Platform.
---

# Agent Platform Evaluation Flywheel

Establishes an automated, closed-loop evaluation flywheel for Gemini-powered autonomous agents on Google Cloud Agent Platform. Covers synthetic test set generation, Golden Dataset curation, metric evaluation (faithfulness, answer relevance, tool-calling precision), and automated regression gating before deployment.

---

## 1. The Evaluation Flywheel Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Vertex AI Agent Platform Eval Flywheel                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. Golden Dataset       2. Batch Inference       3. Metric Evaluators     │
│   ┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐     │
│   │ • User Traces   │ ──> │ • Target Agent   │ ──> │ • Faithfulness   │     │
│   │ • Synthetic QA  │     │ • Prompt Version │     │ • Relevance      │     │
│   │ • Edge Cases    │     │ • Model Baseline │     │ • Tool Precision │     │
│   └─────────────────┘     └──────────────────┘     └────────┬─────────┘     │
│                                                             │               │
│                                                             ▼               │
│   5. Flywheel Adaptation                             4. Quality Gate        │
│   ┌─────────────────┐                              ┌──────────────────┐     │
│   │ • Update Prompts│ <─────────────────────────── │ • Diff vs Baseline│    │
│   │ • Few-Shot Ex.  │   Block deploy if score <    │ • Regression Alert│    │
│   │ • Re-tune Model │   threshold (e.g. 0.90)      │ • Pass / Fail CI │    │
│   └─────────────────┘                              └──────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Defining Evaluation Datasets (JSONL)

Format the evaluation dataset with ground truth expectations and tool execution steps:

```jsonl
{"prompt": "Calculate Q3 revenue for project Titan", "expected_tool_call": "query_revenue", "expected_parameters": {"project": "Titan", "quarter": "Q3"}, "ground_truth": "$14.2M"}
{"prompt": "Summarize incident INC-4921", "expected_tool_call": "fetch_incident", "expected_parameters": {"incident_id": "INC-4921"}, "ground_truth": "Outage caused by database connection starvation."}
```

Upload the dataset to Cloud Storage:
```bash
gcloud storage cp golden_eval_dataset.jsonl gs://my-eval-bucket/datasets/golden_v1.jsonl
```

---

## 3. Running Automated Evaluation via Python SDK

Execute batch evaluation comparing the candidate agent prompt against the production baseline:

```python
"""Automated Agent Evaluation Flywheel using Vertex AI."""

import os
from google.cloud import aiplatform
from vertexai.evaluation import EvalTask, MetricPromptTemplateExamples

def run_agent_eval_flywheel():
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

    aiplatform.init(project=project_id, location=location)

    # 1. Define Candidate and Baseline Prompts
    candidate_prompt = "You are a specialized site reliability engineer..."
    
    # 2. Configure Evaluation Metrics
    metrics = [
        "rouge1",
        "rougeLsum",
        MetricPromptTemplateExamples.Pointwise.TEXT_QUALITY,
        MetricPromptTemplateExamples.Pointwise.QUESTION_ANSWERING_QUALITY,
    ]

    # 3. Create and Execute EvalTask
    eval_task = EvalTask(
        dataset="gs://my-eval-bucket/datasets/golden_v1.jsonl",
        metrics=metrics,
        experiment="gemini-agent-prompt-flywheel-v1",
    )

    eval_result = eval_task.evaluate(
        prompt_template=candidate_prompt,
        evaluation_service_qps=5,
    )

    print("📊 Evaluation Summary:")
    print(eval_result.summary_metrics)

    # 4. Gating Threshold Enforcement
    qa_quality = eval_result.summary_metrics.get("question_answering_quality/mean", 0.0)
    if qa_quality < 0.85:
        raise ValueError(f"❌ Regression detected: QA quality score {qa_quality:.2f} is below 0.85 threshold!")

    print(f"✅ Eval passed! QA Quality: {qa_quality:.2f}")

if __name__ == "__main__":
    run_agent_eval_flywheel()
```

---

## 4. CI/CD Gating with GitHub Actions

Run automated eval checks on pull requests before promoting agent configurations:

```yaml
# .github/workflows/agent-eval.yml
name: Agent Evaluation Flywheel
on:
  pull_request:
    paths:
      - 'rules/**'
      - 'skills/**'
      - 'prompts/**'

jobs:
  eval-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}
      - name: Run Eval Flywheel
        run: |
          pip install google-cloud-aiplatform vertexai
          python scripts/run_eval_flywheel.py
```
