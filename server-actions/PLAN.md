# Server Actions Todo App - Implementation Plan

## Overview
Implement a todo app using Next.js App Router with Server Actions for mutations. This is the most "Next.js native" approach.

## File Structure
```
server-actions/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── actions.ts
├── lib/
│   └── todos.ts
├── package.json
├── tsconfig.json
└── next.config.js
```

## Implementation Steps

### 1. Initialize Next.js project
```bash
npx create-next-app@latest . --typescript --app --no-tailwind --no-eslint --no-src-dir
npm install zod
```

### 2. Create in-memory todo store (`lib/todos.ts`)
- Define `Todo` type with `id` and `text` fields
- Create a module-level array with two pre-defined todos
- Export functions: `getTodos()`, `addTodo(text)`, `removeTodo(id)`

### 3. Create Server Actions (`app/actions.ts`)
```ts
"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { addTodo, removeTodo } from "@/lib/todos"

const addTodoSchema = z.object({
  text: z.string().min(1, "Todo text is required").max(200, "Todo text too long"),
})

const removeTodoSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
})

export async function addTodoAction(formData: FormData) {
  const result = addTodoSchema.safeParse({
    text: formData.get("text"),
  })

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  addTodo(result.data.text)
  revalidatePath("/")
  return { success: true }
}

export async function removeTodoAction(formData: FormData) {
  const result = removeTodoSchema.safeParse({
    id: formData.get("id"),
  })

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  removeTodo(result.data.id)
  revalidatePath("/")
  return { success: true }
}
```

### 4. Create page component (`app/page.tsx`)
- Server Component that calls `getTodos()` directly
- Render list of todos with delete form for each
- Render add todo form at the bottom
- Use native `<form action={...}>` with Server Actions

### 5. Create layout (`app/layout.tsx`)
- Basic HTML structure, no styling

## Key Characteristics
- **No client JavaScript required** for basic functionality (progressive enhancement)
- **Automatic revalidation** via `revalidatePath`
- **Type-safe** with TypeScript
- **Simplest setup** - no additional dependencies
