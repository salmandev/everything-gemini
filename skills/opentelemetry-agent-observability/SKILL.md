---
name: opentelemetry-agent-observability
description: Implements OpenTelemetry GenAI semantic conventions, distributed multi-agent W3C trace propagation, tool call span attributes, and Google Cloud Trace export for autonomous agent workflows.
---

# OpenTelemetry Agent Observability (GenAI Semantic Conventions & Distributed Tracing)

Instruments autonomous multi-agent pipelines with OpenTelemetry (v1.30+), adhering strictly to OpenTelemetry GenAI Semantic Conventions (`gen_ai.system`, `gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`). Propagates W3C `traceparent` headers across subagent handoffs, captures internal thinking token events, and exports traces to Google Cloud Trace and Jaeger.

---

## 1. Multi-Agent Distributed Tracing Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       OPENTELEMETRY TRACE TOPOLOGY                          │
│                                                                             │
│   Planner Span (trace_id: 4bf92f3577b34da6a3ce929d0e0e4736)                 │
│   ├── gen_ai.system: "gemini"                                               │
│   ├── gen_ai.request.model: "gemini-3.8-thinking"                          │
│   │                                                                         │
│   ├── Subagent Handoff (W3C traceparent injected into message payload)       │
│   │   └── Swarm Coordinator Span                                            │
│   │       ├── Worker-1 Tool Execution Span (eBPF Sandboxed)                 │
│   │       └── Worker-2 Tool Execution Span (eBPF Sandboxed)                 │
│   │                                                                         │
│   └── Cloud Trace Exporter (OTLP gRPC -> Google Cloud Trace)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Python OpenTelemetry GenAI Instrumentor

```python
import os
from contextlib import contextmanager
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from opentelemetry.trace import Status, StatusCode

# Initialize TracerProvider and OTLP Exporter
provider = TracerProvider()
otlp_exporter = OTLPSpanExporter(
    endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "localhost:4317"),
    insecure=True
)
provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("everything-gemini.runtime", "2.5.0")
propagator = TraceContextTextMapPropagator()

class AgentTelemetryContext:
    @staticmethod
    @contextmanager
    def start_llm_span(agent_name: str, model_name: str, operation_name: str = "chat"):
        """Starts a span compliant with OpenTelemetry GenAI Semantic Conventions."""
        with tracer.start_as_current_span(
            f"gen_ai.{operation_name} {agent_name}",
            kind=trace.SpanKind.INTERNAL
        ) as span:
            span.set_attribute("gen_ai.system", "gemini")
            span.set_attribute("gen_ai.request.model", model_name)
            span.set_attribute("gen_ai.agent.name", agent_name)
            span.set_attribute("gen_ai.operation.name", operation_name)
            try:
                yield span
            except Exception as exc:
                span.record_exception(exc)
                span.set_status(Status(StatusCode.ERROR, str(exc)))
                raise

    @staticmethod
    def record_usage(span: trace.Span, prompt_tokens: int, completion_tokens: int, thinking_tokens: int = 0):
        """Records standardized GenAI token metrics and thinking tokens."""
        span.set_attribute("gen_ai.usage.input_tokens", prompt_tokens)
        span.set_attribute("gen_ai.usage.output_tokens", completion_tokens)
        span.set_attribute("gen_ai.usage.total_tokens", prompt_tokens + completion_tokens)
        if thinking_tokens > 0:
            span.set_attribute("gen_ai.usage.thinking_tokens", thinking_tokens)
            span.add_event("thinking_budget_allocated", {"tokens": thinking_tokens})

    @staticmethod
    def inject_carrier() -> dict:
        """Injects W3C traceparent into a dictionary for cross-agent RPC or Pub/Sub."""
        carrier = {}
        propagator.inject(carrier)
        return carrier

    @staticmethod
    def extract_context(carrier: dict):
        """Extracts remote trace context from carrier dictionary."""
        return propagator.extract(carrier)
```

---

## 3. Subagent Handoff Trace Propagation Example

When delegating tasks across scoped subagents (e.g. `planner` to `swarm-coordinator`), inject W3C headers to preserve single continuous traces:

```python
# In Planner subagent:
with AgentTelemetryContext.start_llm_span("planner", "gemini-3.8-pro") as span:
    carrier = AgentTelemetryContext.inject_carrier()
    # Payload sent to swarm-coordinator includes trace context
    dispatch_payload = {
        "task": "refactor_auth_module",
        "trace_context": carrier
    }
    AgentTelemetryContext.record_usage(span, prompt_tokens=1200, completion_tokens=340)

# In Swarm Coordinator:
ctx = AgentTelemetryContext.extract_context(dispatch_payload["trace_context"])
with tracer.start_as_current_span("swarm_coordinator.execute", context=ctx) as sub_span:
    sub_span.set_attribute("swarm.workers.count", 4)
    # Child spans automatically link to the parent Planner span
```

---

## 4. Google Cloud Trace Integration via Terraform

```hcl
resource "google_project_iam_member" "agent_trace_agent" {
  project = var.gcp_project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${google_service_account.agent_runtime.email}"
}
```

Export telemetry with standard environment variables:
```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="https://cloudtrace.googleapis.com"
export OTEL_RESOURCE_ATTRIBUTES="service.name=everything-gemini,service.version=2.5.0"
```
