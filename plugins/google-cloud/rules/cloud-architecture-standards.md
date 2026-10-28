# Google Cloud & Agent Platform Architectural Standards

Adhere strictly to the Google Cloud Well-Architected Framework and production agent engineering standards when designing or deploying cloud services.

---

## 1. Zero-Trust Identity & Authentication
- **Workload Identity Federation**: Never export or hardcode static JSON service account keys.
- **Application Default Credentials (ADC)**: Use `google.auth.default()` or `gcloud auth application-default login` for local execution.
- **Short-Lived Tokens**: In production GKE, Cloud Run, and Agent Substrate, attach IAM service accounts directly to compute runtimes with minimally scoped roles.

---

## 2. Vertex AI & Agent Platform Architecture
- **Model Selection & Tuning**: Use `gemini-3.8-flash` for high-velocity streaming tasks and `gemini-2.5-pro` for deep analytical reasoning.
- **RAG Engine Grounding**: Store documents in Cloud Storage, chunk using semantic chunkers, and ground agents via Vertex AI RAG Corpus with Hybrid Search.
- **Continuous Evaluation**: Maintain a versioned Golden Evaluation Dataset. Never deploy agent prompt or parameter changes without passing automated eval thresholds (faithfulness $\ge 0.90$, answer relevance $\ge 0.88$).

---

## 3. Google Genkit Standards
- **Flow Granularity**: Encapsulate distinct agent capabilities in discrete Genkit flows (`defineFlow`).
- **Structured Schemas**: Enforce Zod (TypeScript) or Pydantic (Python) schemas on all flow inputs, tool parameters, and model outputs.
- **Telemetry & Tracing**: Enable OpenTelemetry exporters to Google Cloud Trace and Cloud Logging on all production Genkit entry points.

---

## 4. Compute & Storage Best Practices
- **Cloud Storage FUSE**: Enable local file caching (`--file-cache:max-size-mb`) for read-heavy ML training and dataset access.
- **GKE AI/ML Scheduling**: Utilize node selectors and tolerations for TPU v4/v5e slices. Configure MXLA hang detection sidecars for distributed training jobs.
- **Egress Network Fencing**: Enforce strict egress firewall rules or AX Gateway allowlists locking down outbound traffic to authorized Google API endpoints and Git remotes.
