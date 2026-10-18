---
name: grpc-connect-rpc
description: >-
  Architects and implements high-performance, browser-compatible gRPC and Protocol Buffer services using Connect-RPC (Connect-ES & Connect-Go), HTTP/2 & HTTP/3 streaming, and type-safe schema generation.
---

# Connect-RPC & Modern Protocol Buffers

This skill guides building fast, ergonomic, and 100% browser-compatible RPC services using Connect-RPC (by Buf). Connect implements the gRPC, gRPC-Web, and Connect protocols natively over HTTP/1.1, HTTP/2, and HTTP/3 without requiring Envoy proxy sidecars.

---

## ⚡ Core Patterns

### 1. Protobuf Service Definition (`buf.build` Standard)

Define service contracts and strongly-typed data structures:

```protobuf
// proto/commerce/v1/order.proto
syntax = "proto3";

package commerce.v1;

option go_package = "github.com/company/commerce/gen/commerce/v1;commercev1";

service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (CreateOrderResponse);
  rpc StreamOrderUpdates(StreamOrderUpdatesRequest) returns (stream StreamOrderUpdatesResponse);
}

message CreateOrderRequest {
  string customer_id = 1;
  repeated OrderItem items = 2;
  double total_usd = 3;
}

message OrderItem {
  string sku = 1;
  int32 quantity = 2;
  double price_usd = 3;
}

message CreateOrderResponse {
  string order_id = 1;
  string status = 2;
  int64 created_at_unix = 3;
}

message StreamOrderUpdatesRequest {
  string order_id = 1;
}

message StreamOrderUpdatesResponse {
  string order_id = 1;
  string current_status = 2;
  string message = 3;
  int64 timestamp = 4;
}
```

Compile with `buf generate`:

```yaml
# buf.gen.yaml
version: v2
plugins:
  - local: protoc-gen-es
    out: gen/ts
    opt: target=ts
  - local: protoc-gen-connect-es
    out: gen/ts
    opt: target=ts
  - local: protoc-gen-go
    out: gen/go
    opt: paths=source_relative
  - local: protoc-gen-connect-go
    out: gen/go
    opt: paths=source_relative
```

---

### 2. Node.js / TypeScript Server Implementation (Connect-ES)

Implement the typed service handler with zero boilerplate:

```typescript
import { ConnectRouter } from '@connectrpc/connect';
import { OrderService } from './gen/ts/commerce/v1/order_connect';
import { fastify } from 'fastify';
import { fastifyConnectPlugin } from '@connectrpc/connect-fastify';

function routes(router: ConnectRouter) {
  router.service(OrderService, {
    async createOrder(req) {
      if (!req.customerId || req.items.length === 0) {
        throw new ConnectError('Order must contain a customerId and items', Code.InvalidArgument);
      }

      const orderId = `ord_${crypto.randomUUID().slice(0, 8)}`;
      return {
        orderId,
        status: 'PENDING_PAYMENT',
        createdAtUnix: BigInt(Date.now()),
      };
    },

    async *streamOrderUpdates(req) {
      const statuses = ['PAYMENT_CONFIRMED', 'WAREHOUSE_PICKED', 'IN_TRANSIT', 'DELIVERED'];
      for (const status of statuses) {
        await new Promise((r) => setTimeout(r, 1000));
        yield {
          orderId: req.orderId,
          currentStatus: status,
          message: `Package status updated to ${status}`,
          timestamp: BigInt(Date.now()),
        };
      }
    },
  });
}

const server = fastify({ http2: true });
await server.register(fastifyConnectPlugin, { routes });
await server.listen({ host: '0.0.0.0', port: 8080 });
```

---

### 3. Native Browser Client (No Envoy Proxy Needed)

Invoke typed RPCs directly from modern browsers or Next.js applications:

```typescript
import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { OrderService } from './gen/ts/commerce/v1/order_connect';

// Transport supports pure HTTP POST requests with JSON or binary Protobuf envelopes
const transport = createConnectTransport({
  baseUrl: 'https://api.example.com',
});

const client = createClient(OrderService, transport);

// 1. Unary RPC Call
const response = await client.createOrder({
  customerId: 'cust_98234',
  items: [{ sku: 'CLOUD-GPU-A100', quantity: 2, priceUsd: 1450.0 }],
  totalUsd: 2900.0,
});
console.log('Created order:', response.orderId);

// 2. Server Streaming RPC Call
for await (const update of client.streamOrderUpdates({ orderId: response.orderId })) {
  console.log(`Live Status [${update.currentStatus}]: ${update.message}`);
}
```

---

## 🎯 Verification & Diagnostics

1. **Test Service with cURL (Standard HTTP POST)**:
   ```bash
   curl \
     --header "Content-Type: application/json" \
     --data '{"customerId": "cust_123", "items": [{"sku": "PROD-1", "quantity": 1, "priceUsd": 99.0}], "totalUsd": 99.0}' \
     https://api.example.com/commerce.v1.OrderService/CreateOrder
   ```
2. **Inspect Buf Lint & Breaking Change Rules**:
   ```bash
   buf lint
   buf breaking --against ".git#branch=main"
   ```
