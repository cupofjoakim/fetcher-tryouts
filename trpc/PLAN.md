# tRPC + TanStack Query Todo App - Implementation Plan

## Overview
Implement a todo app using Next.js App Router with tRPC for end-to-end type-safe API calls.

## File Structure
```
trpc/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   └── api/
│       └── trpc/
│           └── [trpc]/
│               └── route.ts
├── components/
│   └── todo-list.tsx
├── lib/
│   ├── todos.ts
│   └── trpc/
│       ├── client.ts
│       ├── server.ts
│       └── routers/
│           └── todo.ts
├── package.json
├── tsconfig.json
└── next.config.js
```

## Implementation Steps

### 1. Initialize Next.js project
```bash
npx create-next-app@latest . --typescript --app --no-tailwind --no-eslint --no-src-dir
```

### 2. Install tRPC and dependencies
```bash
npm install @trpc/server @trpc/client @trpc/react-query @tanstack/react-query zod superjson
```

### 3. Create in-memory todo store (`lib/todos.ts`)
- Same as other implementations

### 4. Create tRPC server setup (`lib/trpc/server.ts`)
```ts
import { initTRPC } from "@trpc/server"
import superjson from "superjson"

const t = initTRPC.create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure
```

### 5. Create todo router (`lib/trpc/routers/todo.ts`)
```ts
import { z } from "zod"
import { router, publicProcedure } from "../server"
import { getTodos, addTodo, removeTodo } from "@/lib/todos"

export const todoRouter = router({
  list: publicProcedure.query(() => getTodos()),
  add: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(({ input }) => addTodo(input.text)),
  remove: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => removeTodo(input.id)),
})
```

### 6. Create app router (`lib/trpc/routers/_app.ts`)
```ts
import { router } from "../server"
import { todoRouter } from "./todo"

export const appRouter = router({
  todo: todoRouter,
})

export type AppRouter = typeof appRouter
```

### 7. Create tRPC client (`lib/trpc/client.ts`)
```ts
import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "./routers/_app"

export const trpc = createTRPCReact<AppRouter>()
```

### 8. Create API route handler (`app/api/trpc/[trpc]/route.ts`)
```ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "@/lib/trpc/routers/_app"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  })

export { handler as GET, handler as POST }
```

### 9. Create providers (`app/providers.tsx`)
- Setup QueryClient and tRPC client
- Wrap with both providers

### 10. Create TodoList component (`components/todo-list.tsx`)
```tsx
"use client"

import { trpc } from "@/lib/trpc/client"

export function TodoList({ initialTodos }) {
  const todos = trpc.todo.list.useQuery(undefined, { initialData: initialTodos })
  const addMutation = trpc.todo.add.useMutation({
    onSuccess: () => todos.refetch()
  })
  // ...
}
```

### 11. Create page and layout

## Key Characteristics
- **End-to-end type safety** - types flow from server to client
- **Input validation** with Zod
- **Automatic TypeScript inference**
- **More setup** but very robust for larger apps
