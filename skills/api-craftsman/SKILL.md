---
name: api-craftsman
description: >-
  Designs, specifies, and reviews production-grade REST APIs, OpenAPI 3.1 specifications, gRPC protobuf schemas, and GraphQL types. Use when creating or updating API contracts.
---

# API Craftsman

This skill enforces industry-leading API design principles, contract-first development, and consistent versioning.

## API Design Principles

### 1. Resource-Oriented REST
- **Nouns, Not Verbs**: Use `/api/v1/orders` instead of `/api/v1/getOrders`.
- **HTTP Methods Semantics**:
  - `GET`: Safe, idempotent retrieval.
  - `POST`: Non-idempotent creation or processing.
  - `PUT`: Complete idempotent replacement.
  - `PATCH`: Partial modification.
  - `DELETE`: Idempotent removal.
- **Consistent Response Envelopes**:
  ```json
  {
    "data": { ... },
    "error": null,
    "meta": { "page": 1, "pageSize": 20, "total": 100 }
  }
  ```

### 2. Contract-First OpenAPI 3.1
Define schemas in OpenAPI 3.1 YAML before writing backend route handlers. Validate schemas using Zod or Pydantic models on the server.

### 3. Error Standard (RFC 7807)
Always return errors conforming to the Problem Details specification:
```json
{
  "type": "https://api.example.com/errors/invalid-argument",
  "title": "Invalid Argument",
  "status": 400,
  "detail": "Field 'email' must be a valid email address.",
  "instance": "/orders/123/items"
}
```

For OpenAPI 3.1 sample specifications, see [examples/openapi-spec.yaml](./examples/openapi-spec.yaml).
