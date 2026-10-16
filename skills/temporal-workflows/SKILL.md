---
name: temporal-workflows
description: >-
  Architects and implements fault-tolerant distributed workflows, retry policies, async activities, saga compensations, and child workflows using the Temporal TypeScript/Python SDK.
---

# Temporal Workflows & Resilient Distributed Orchestration

This skill guides the design and implementation of bulletproof distributed workflows with Temporal, ensuring zero state loss during worker crashes, network partitions, or transient external API failures.

---

## ⚡ The Cardinal Rule: Workflow Determinism

Workflows in Temporal are replayed from event history. Therefore, **workflow functions must be 100% deterministic**:

| ❌ NEVER in Workflow Functions | ✅ ALWAYS in Activities or SDK Wrappers |
| :--- | :--- |
| `Date.now()`, `new Date()` | `workflow.currentTime()` |
| `Math.random()`, `crypto.randomUUID()` | Pass random values as input or generate in Activities |
| `fetch()`, database queries, file I/O | Isolate all network, disk, and DB calls inside Activities |
| Mutable global variables, timers (`setTimeout`) | Use `workflow.sleep()` or `workflow.condition()` |

---

## 🏗️ Architecture: Workflows & Activities (TypeScript)

### 1. Activities Definition (`activities.ts`)
Activities handle all non-deterministic side effects and I/O:

```typescript
import { Context } from '@temporalio/activity';

export async function chargePayment(customerId: string, amountCents: number): Promise<string> {
  const { heartbeat } = Context.current();
  heartbeat('Connecting to payment gateway');
  
  // Call external Stripe or payment API
  const chargeId = await stripeClient.charges.create({ customer: customerId, amount: amountCents });
  return chargeId;
}

export async function refundPayment(chargeId: string): Promise<void> {
  await stripeClient.refunds.create({ charge: chargeId });
}

export async function provisionResource(tenantId: string): Promise<string> {
  return await cloudProvider.provision(tenantId);
}
```

---

### 2. Workflow Orchestration with Saga Compensations (`workflows.ts`)

```typescript
import { proxyActivities, sleep, defineSignal, setHandler, condition } from '@temporalio/workflow';
import type * as activities from './activities';

// Configure activity timeouts and retry policies
const { chargePayment, refundPayment, provisionResource } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    initialInterval: '2 seconds',
    backoffCoefficient: 2,
    maximumInterval: '1 minute',
    maximumAttempts: 5,
    nonRetryableErrorTypes: ['InvalidCardError', 'CustomerNotFoundError'],
  },
});

export const cancelOrderSignal = defineSignal('cancelOrder');

export async function orderFulfillmentWorkflow(order: { customerId: string; amount: number; tenantId: string }): Promise<string> {
  const compensations: Array<() => Promise<void>> = [];
  let isCancelled = false;

  // Listen for external user cancellation signal
  setHandler(cancelOrderSignal, () => {
    isCancelled = true;
  });

  try {
    // Step 1: Charge payment
    const chargeId = await chargePayment(order.customerId, order.amount);
    compensations.push(async () => await refundPayment(chargeId));

    if (isCancelled) {
      throw new Error('Order cancelled by user before provisioning');
    }

    // Step 2: Provision cloud resources
    const resourceId = await provisionResource(order.tenantId);
    return resourceId;

  } catch (error) {
    // SAGA Pattern: Execute compensations in reverse order
    for (const compensate of compensations.reverse()) {
      try {
        await compensate();
      } catch (compErr) {
        // Log critical compensation failure for manual intervention
      }
    }
    throw error;
  }
}
```

---

## 🧪 Testing Workflows (`workflow.test.ts`)

Test workflows without connecting to a remote Temporal server using `TestWorkflowEnvironment`:

```typescript
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { orderFulfillmentWorkflow } from './workflows';

describe('orderFulfillmentWorkflow', () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createTimeSkipping();
  });

  afterAll(async () => {
    await testEnv?.teardown();
  });

  it('successfully completes workflow with mocked activities', async () => {
    const { client, nativeConnection } = testEnv;
    const taskQueue = 'test-queue';

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue,
      workflowsPath: require.resolve('./workflows'),
      activities: {
        chargePayment: async () => 'ch_test_123',
        refundPayment: async () => {},
        provisionResource: async () => 'res_prod_999',
      },
    });

    await worker.runUntil(async () => {
      const handle = await client.workflow.start(orderFulfillmentWorkflow, {
        args: [{ customerId: 'cust_1', amount: 5000, tenantId: 'ten_abc' }],
        taskQueue,
        workflowId: 'test-order-1',
      });
      const result = await handle.result();
      expect(result).toBe('res_prod_999');
    });
  });
});
```
