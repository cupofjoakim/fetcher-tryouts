# Raw Fetch + TanStack Query Todo App - Implementation Plan

## Overview
Implement a todo app using Next.js App Router with API routes and TanStack Query for client-side state management.

## File Structure
```
raw-fetch/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   └── api/
│       └── todos/
│           ├── route.ts
│           └── [id]/
│               └── route.ts
├── components/
│   └── todo-list.tsx
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
```

### 2. Install TanStack Query and Zod
```bash
npm install @tanstack/react-query zod
```

### 3. Create in-memory todo store (`lib/todos.ts`)
- Define `Todo` type with `id` and `text` fields
- Create module-level array with two pre-defined todos
- Export functions: `getTodos()`, `addTodo(text)`, `removeTodo(id)`

### 4. Create API routes

**`app/api/todos/route.ts`** (GET all, POST new):
```ts
import { NextResponse } from "next/server"
import { z } from "zod"
import { getTodos, addTodo } from "@/lib/todos"

const addTodoSchema = z.object({
  text: z.string().min(1, "Todo text is required").max(200, "Todo text too long"),
})

export async function GET() {
  return NextResponse.json(getTodos())
}

export async function POST(request: Request) {
  const body = await request.json()
  const result = addTodoSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const todo = addTodo(result.data.text)
  return NextResponse.json(todo)
}
```

**`app/api/todos/[id]/route.ts`** (DELETE):
```ts
import { NextResponse } from "next/server"
import { z } from "zod"
import { removeTodo } from "@/lib/todos"

const deleteSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
})

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const result = deleteSchema.safeParse({ id: params.id })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  removeTodo(result.data.id)
  return NextResponse.json({ success: true })
}
```

### 5. Create TanStack Query provider (`app/providers.tsx`)
```tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### 6. Create TodoList client component (`components/todo-list.tsx`)
```tsx
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// useQuery for fetching todos
// useMutation for add/remove with queryClient.invalidateQueries on success
```

### 7. Create page component (`app/page.tsx`)
- Server Component that fetches initial todos
- Pass initial data to client component for hydration
- Use `initialData` option in useQuery

### 8. Update layout with providers

## Key Characteristics
- **Full control** over API design and fetch logic
- **Manual type definitions** for API responses
- **Standard REST patterns**
- **More boilerplate** but transparent
