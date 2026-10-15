# Next.js App Router Architecture & Patterns

## 1. Safe Server Action Pattern with Zod
```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const CreateTodoSchema = z.object({
  title: z.string().min(1).max(100),
});

export async function createTodo(formData: FormData) {
  const parsed = CreateTodoSchema.safeParse({
    title: formData.get('title'),
  });

  if (!parsed.success) {
    return { error: 'Invalid input', issues: parsed.error.issues };
  }

  // Database insert
  // await db.todos.create({ data: { title: parsed.data.title } });

  revalidatePath('/todos');
  return { success: true };
}
```

## 2. Suspense & Streaming Data Fetching
```tsx
import { Suspense } from 'react';
import { UserProfileSkeleton, UserProfile } from './UserProfile';

export default function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Suspense fallback={<UserProfileSkeleton />}>
        <UserProfile />
      </Suspense>
    </main>
  );
}
```
