---
name: graphql-architect
description: Designs, specifies, and implements production GraphQL APIs, DataLoader N+1 query batching, Relay-style cursor pagination, and schema federation.
---

# GraphQL Architecture & API Craftsmanship

This skill guides the design, schema modeling, query optimization, and implementation of production-grade GraphQL APIs.

---

## 1. Core Principles

1. **Schema-First Design**:
   - Model client domain requirements into a declarative Schema Definition Language (SDL) before implementing resolvers.
2. **Defeat the N+1 Problem**:
   - Never query database tables inside nested resolvers without a batching mechanism (e.g., `DataLoader`).
3. **Cursor-Based Pagination**:
   - For real-time or dynamic lists, implement Relay-compliant cursor pagination (`Connection`, `Edge`, `PageInfo`) rather than offset/limit pagination.

---

## 2. Relay-Compliant Cursor Pagination Pattern

```graphql
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type UserEdge {
  cursor: String!
  node: User!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type Query {
  users(first: Int, after: String): UserConnection!
}
```

---

## 3. DataLoader Batching Blueprint

Prevent database query fan-out by batching IDs into a single SQL `IN` query per event loop tick:

```typescript
import DataLoader from 'dataloader';

// Batch function loading users by array of IDs
const batchUsers = async (userIds: readonly string[]): Promise<(User | Error)[]> => {
  const users = await db.user.findMany({
    where: { id: { in: [...userIds] } },
  });
  
  // Map results back to exact input order
  const userMap = new Map(users.map(u => [u.id, u]));
  return userIds.map(id => userMap.get(id) || new Error(`User ${id} not found`));
};

export const createUserDataLoader = () => new DataLoader(batchUsers);
```

---

## 4. Query Complexity & Depth Limiting

To prevent Denial-of-Service attacks through cyclic or deeply nested queries:
- Enforce maximum query depth (e.g., max 6 levels).
- Assign cost multipliers to nested connections to reject queries exceeding complexity thresholds.
