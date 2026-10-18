---
name: open-telemetry-tracing
description: >-
  Architects and instruments distributed tracing, OTLP exporters, W3C traceparent propagation, custom span attributes, and metric correlations using OpenTelemetry (Node.js/Python).
---

# OpenTelemetry Distributed Tracing & Observability

This skill guides the implementation of production-grade distributed tracing using the OpenTelemetry (OTel) standard, providing end-to-end request visibility across microservices, async event buses, and AI agent reasoning loops.

---

## ⚡ The Observability Triad in OpenTelemetry

1. **Traces**: Directed acyclic graphs of spans tracking request lifecycles across process boundaries.
2. **Context Propagation**: Standardized W3C `traceparent` HTTP headers (`00-<trace_id>-<span_id>-<flags>`).
3. **Semantic Conventions**: Standardized attribute keys (`http.status_code`, `db.system`, `gen_ai.request.model`).

---

## 🏗️ Production Implementation (Node.js / TypeScript)

### 1. SDK Initialization (`instrumentation.ts`)

Must execute before any other application modules are imported:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'agentic-gateway',
    [SEMRESATTRS_SERVICE_VERSION]: '1.7.0',
    'deployment.environment': process.env.NODE_ENV || 'production',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318/v1/traces',
    headers: {},
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false }, // Prevent span explosion
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .finally(() => process.exit(0));
});
```

---

### 2. Custom Business & Agent Spans (`tracer.ts`)

```typescript
import { trace, SpanStatusCode, propagation, context } from '@opentelemetry/api';

const tracer = trace.getTracer('agent-core', '1.7.0');

export async function executeAgentReasoningStep<T>(
  stepName: string,
  modelName: string,
  fn: () => Promise<T>
): Promise<T> {
  return tracer.startActiveSpan(
    `agent.reasoning.${stepName}`,
    {
      attributes: {
        'gen_ai.system': 'google-gemini',
        'gen_ai.request.model': modelName,
        'agent.step': stepName,
      },
    },
    async (span) => {
      try {
        span.addEvent('llm_prompt_dispatched', { timestamp: Date.now() });
        const result = await fn();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error: any) {
        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error?.message || 'Reasoning execution failed',
        });
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

/** Propagate traceparent to downstream HTTP calls */
export function injectTraceHeaders(targetHeaders: Record<string, string>): void {
  propagation.inject(context.active(), targetHeaders);
}
```

---

## 🐍 Python Implementation (`telemetry.py`)

```python
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.trace import Status, StatusCode

provider = TracerProvider(
    resource=Resource.create({"service.name": "python-worker", "service.version": "1.7.0"})
)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="http://otel-collector:4318/v1/traces"))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer("worker-agent", "1.7.0")

def run_workflow_step(task_id: str):
    with tracer.start_as_current_span("worker.process_task") as span:
        span.set_attribute("task.id", task_id)
        try:
            # Task logic here
            span.set_status(Status(StatusCode.OK))
        except Exception as exc:
            span.record_exception(exc)
            span.set_status(Status(StatusCode.ERROR, str(exc)))
            raise
```

---

## 🛡️ Best Practices & Guardrails

| Category | ❌ Anti-Pattern | ✅ Production Best Practice |
| :--- | :--- | :--- |
| **Span Lifecycle** | Forgetting to invoke `span.end()` in error blocks | Wrap with `try / catch / finally` and call `span.end()` |
| **High Cardinality** | Injecting user emails, passwords, or raw tokens into attributes | Use hashed IDs (`user_hash`), sanitize PII, follow semantic conventions |
| **Context Leaks** | Starting detached spans without active parent context | Use `tracer.startActiveSpan()` to maintain parent-child hierarchy |
| **Over-instrumentation** | Tracing every internal loop iteration or file read | Instrument service boundaries, external HTTP/DB calls, and workflow steps |
