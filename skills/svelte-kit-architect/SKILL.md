---
name: svelte-kit-architect
description: >-
  Architects, builds, and optimizes modern SvelteKit web applications using Svelte 5 runes ($state, $derived, $effect), SSR/prerendering, form actions, and type-safe server load functions.
---

# SvelteKit Architect & Svelte 5 Mastery

This skill guides the design, structure, and implementation of production SvelteKit applications utilizing modern Svelte 5 Runes, progressive enhancement, and robust server-side routing.

---

## ⚡ Svelte 5 Runes Modernization

Svelte 5 replaces legacy `export let` and `$:` syntax with explicit, fine-grained reactivity runes:

### 1. State, Derived & Props

```svelte
<script lang="ts">
  interface Props {
    title: string;
    initialCount?: number;
    onUpdate?: (val: number) => void;
  }

  // Props declaration with defaults
  let { title, initialCount = 0, onUpdate }: Props = $props();

  // Reactive state
  let count = $state(initialCount);

  // Derived computed values
  let doubled = $derived(count * 2);

  function increment() {
    count += 1;
    onUpdate?.(count);
  }

  // Side-effect cleanup
  $effect(() => {
    console.log(`Current count: ${count}`);
    return () => console.log('Cleaning up effect');
  });
</script>

<button onclick={increment}>
  {title}: {count} (Doubled: {doubled})
</button>
```

---

## 📁 SvelteKit Routing & Data Loading

### 1. Type-Safe Server Load Function (`+page.server.ts`)

```typescript
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals }) => {
  const item = await db.item.findUnique({
    where: { id: params.id },
  });

  if (!item) {
    throw error(404, { message: 'Item not found' });
  }

  return {
    item,
    user: locals.user,
  };
};
```

### 2. Rendering Data in Component (`+page.svelte`)

```svelte
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<h1>{data.item.title}</h1>
<p>Author: {data.user?.name ?? 'Anonymous'}</p>
```

---

## 📝 Form Actions & Progressive Enhancement

Handle mutations without client-side JavaScript dependency while maintaining smooth client transitions using `use:enhance`:

### Server Action (`+page.server.ts`)

```typescript
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  comment: z.string().min(3),
});

export const actions: Actions = {
  createComment: async ({ request }) => {
    const formData = await request.formData();
    const parsed = schema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return fail(400, {
        errors: parsed.error.flatten().fieldErrors,
        values: Object.fromEntries(formData),
      });
    }

    // Process mutation in database
    return { success: true };
  },
};
```

### Form in Svelte Component (`+page.svelte`)

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let isSubmitting = $state(false);
</script>

<form
  method="POST"
  action="?/createComment"
  use:enhance={() => {
    isSubmitting = true;
    return async ({ update }) => {
      isSubmitting = false;
      await update();
    };
  }}
>
  <input name="email" type="email" value={form?.values?.email ?? ''} required />
  {#if form?.errors?.email}
    <span class="error">{form.errors.email[0]}</span>
  {/if}

  <textarea name="comment" required></textarea>

  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Submitting...' : 'Post Comment'}
  </button>
</form>
```

---

## 🌐 Global Shared State with Rune Classes

Use universal classes with `$state` for application-wide stores without legacy Svelte `writable`:

```typescript
// src/lib/stores/cart.svelte.ts
export class CartStore {
  items = $state<Array<{ id: string; qty: number }>>([]);

  get totalItems() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  }

  addItem(id: string) {
    const existing = this.items.find((i) => i.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ id, qty: 1 });
    }
  }
}

export const cart = new CartStore();
```
