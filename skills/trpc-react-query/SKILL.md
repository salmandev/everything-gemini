---
name: trpc-react-query
description: >-
  Architects end-to-end type-safe APIs with tRPC v11 and TanStack React Query v5, implementing routers, context middlewares, mutations, and optimistic cache updates.
---

# tRPC v11 & TanStack React Query v5 Architecture

This skill guides building end-to-end type-safe fullstack applications where frontend components get compile-time autocomplete and validation for backend routes without generating client SDKs.

---

## ⚡ Server-Side Router Architecture

### 1. Initialization & Context (`trpc.ts`)

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getAuthSession } from '$lib/auth';

export async function createContext(opts?: CreateNextContextOptions) {
  const session = await getAuthSession(opts?.req, opts?.res);
  return { session, db };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Protected Procedure Middleware
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});
```

---

### 2. Feature Subrouter with Input Validation (`routers/tasks.ts`)

```typescript
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const taskRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'completed']).optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.task.findMany({
        where: { userId: ctx.user.id, ...(input.status && { status: input.status }) },
        take: input.limit,
        orderBy: { createdAt: 'desc' },
      });
    }),

  toggleStatus: protectedProcedure
    .input(z.object({ id: z.string().uuid(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.task.update({
        where: { id: input.id, userId: ctx.user.id },
        data: { completed: input.completed },
      });
    }),
});
```

---

## 🌐 Client-Side React Query Integration

### 1. Optimistic UI Updates (`TaskList.tsx`)

Render instant UI updates while the network request is inflight, reverting cleanly if an error occurs:

```tsx
import { trpc } from '@/utils/trpc';

export function TaskItem({ task }: { task: Task }) {
  const utils = trpc.useUtils();

  const toggleMutation = trpc.task.toggleStatus.useMutation({
    onMutate: async (variables) => {
      // 1. Cancel ongoing queries for list
      await utils.task.list.cancel();

      // 2. Snapshot previous cache value
      const previousTasks = utils.task.list.getData();

      // 3. Optimistically update client cache
      utils.task.list.setData(undefined, (old) =>
        old?.map((t) => (t.id === variables.id ? { ...t, completed: variables.completed } : t))
      );

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // 4. Rollback cache upon mutation failure
      if (context?.previousTasks) {
        utils.task.list.setData(undefined, context.previousTasks);
      }
    },
    onSettled: () => {
      // 5. Invalidate and synchronize with source of truth
      utils.task.list.invalidate();
    },
  });

  return (
    <div>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => toggleMutation.mutate({ id: task.id, completed: e.target.checked })}
      />
      <span>{task.title}</span>
    </div>
  );
}
```

---

## 🚀 Server-Side Prefetching (Next.js App Router / SSR)

```typescript
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/trpc';
import SuperJSON from 'superjson';

export async function prefetchTasks() {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: SuperJSON,
  });

  await helpers.task.list.prefetch({ limit: 20 });
  return helpers.dehydrate();
}
```
