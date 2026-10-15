---
name: performance-profiler
description: >-
  Profiles application latency, CPU usage, memory leaks, and database bottlenecks. Use when diagnosing slow response times, high resource consumption, or memory leaks.
---

# Performance Profiler

This skill guides the agent through systematic latency and resource bottleneck profiling.

## Profiling Workflow

### 1. Identify the Bottleneck Metric
Determine the performance symptom:
- **High CPU**: Algorithmic complexity ($O(n^2)$), tight loops, excessive JSON serialization.
- **High Memory / Leak**: Retained closures, unclosed database streams, unbounded in-memory caches.
- **High Latency (I/O)**: N+1 database queries, unindexed SQL lookups, synchronous blocking disk I/O.

### 2. Node.js & V8 Profiling
Run Node with the V8 sampling profiler:
```bash
node --prof app.js
node --prof-process isolate-*.log > processed.txt
```

### 3. Database Query Analysis
- **PostgreSQL**: Run `EXPLAIN (ANALYZE, BUFFERS) <query>` to inspect sequential scans, join types, and execution time.
- **Indexes**: Verify that high-cardinality `WHERE` and `JOIN` columns have appropriate B-Tree or Hash indexes.

### 4. Memory Heap Dumps
Capture heap snapshots or track memory diffs between iterations to isolate leaks:
```javascript
const mem = process.memoryUsage();
console.log(`Heap Used: ${Math.round(mem.heapUsed / 1024 / 1024)} MB`);
```
