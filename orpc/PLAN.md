# oRPC + TanStack Query Todo App - Implementation Plan

Based on official docs: https://orpc.dev/docs/adapters/next and https://orpc.dev/docs/integrations/tanstack-query

## Overview
Implement a todo app using Next.js App Router with oRPC for end-to-end type-safe API calls.

## File Structure
```
orpc/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   └── rpc/
│       └── [[...rest]]/
│           └── route.ts          # oRPC handler at /rpc
├── components/
│   └── todo-list.tsx
├── lib/
│   ├── todos.ts                  # In-memory store
│   └── orpc/
│       ├── router.ts             # Server router definition
│       └── client.ts             # Client setup
├── package.json
└── tsconfig.json
```

## Implementation Steps

### 1. Initialize Next.js project
```bash
npx create-next-app@latest orpc --typescript --app --no-tailwind --no-eslint --no-src-dir --use-npm --turbopack --yes
```

### 2. Install dependencies
```bash
npm install @orpc/server @orpc/client @orpc/tanstack-query @tanstack/react-query zod
```

### 3. Create in-memory todo store (`lib/todos.ts`)
Same as other implementations.

### 4. Create oRPC router (`lib/orpc/router.ts`)
```ts
import { os } from "@orpc/server"
import { z } from "zod"
import { getTodos, addTodo, removeTodo } from "@/lib/todos"

const base = os

export const router = {
  todo: {
    list: base.handler(() => getTodos()),
    add: base
      .input(z.object({ text: z.string().min(1).max(200) }))
      .handler(({ input }) => addTodo(input.text)),
    remove: base
      .input(z.object({ id: z.string().uuid() }))
      .handler(({ input }) => {
        removeTodo(input.id)
        return { success: true }
      }),
  },
}

export type Router = typeof router
```

### 5. Create API route handler (`app/rpc/[[...rest]]/route.ts`)
```ts
import { RPCHandler } from "@orpc/server/fetch"
import { router } from "@/lib/orpc/router"

const handler = new RPCHandler(router)

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/rpc",
    context: {},
  })
  return response ?? new Response("Not found", { status: 404 })
}

export const GET = handleRequest
export const POST = handleRequest
```

### 6. Create oRPC client (`lib/orpc/client.ts`)
```ts
import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import type { RouterClient } from "@orpc/server"
import type { Router } from "./router"

export type Client = RouterClient<Router>

export function createClient(): Client {
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/rpc`
    : "http://localhost:3000/rpc"

  const link = new RPCLink({ url })
  return createORPCClient<Client>(link)
}

export function createORPCUtils(client: Client) {
  return createTanstackQueryUtils(client)
}
```

### 7. Create providers (`app/providers.tsx`)
```tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, createContext, useContext, useMemo } from "react"
import { createClient, createORPCUtils } from "@/lib/orpc/client"

const ORPCContext = createContext<ReturnType<typeof createORPCUtils> | null>(null)

export function useORPC() {
  const ctx = useContext(ORPCContext)
  if (!ctx) throw new Error("useORPC must be used within Providers")
  return ctx
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const orpc = useMemo(() => {
    const client = createClient()
    return createORPCUtils(client)
  }, [])

  return (
    <ORPCContext.Provider value={orpc}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ORPCContext.Provider>
  )
}
```

### 8. Create TodoList component (`components/todo-list.tsx`)
```tsx
"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useORPC } from "@/app/providers"
import type { Todo } from "@/lib/todos"

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [text, setText] = useState("")
  const orpc = useORPC()
  const queryClient = useQueryClient()

  const { data: todos = [] } = useQuery({
    ...orpc.todo.list.queryOptions({ input: undefined }),
    initialData: initialTodos,
  })

  const addMutation = useMutation({
    ...orpc.todo.add.mutationOptions({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.todo.list.key() })
      setText("")
    },
  })

  const removeMutation = useMutation({
    ...orpc.todo.remove.mutationOptions({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.todo.list.key() })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      addMutation.mutate({ text: text.trim() })
    }
  }

  return (
    <div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.text}
            <button
              onClick={() => removeMutation.mutate({ id: todo.id })}
              disabled={removeMutation.isPending}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a todo..."
        />
        <button type="submit" disabled={!text.trim()}>
          Add
        </button>
      </form>
    </div>
  )
}
```

### 9. Create page and layout

## Key Differences from Previous Attempt
1. **Route path**: `/rpc` not `/api` (per docs)
2. **Package**: `@orpc/tanstack-query` not `@orpc/react-query`
3. **Function**: `createTanstackQueryUtils` not `createRouterUtils`
4. **Client creation**: Use `useMemo` in provider, not `useEffect`
5. **Mutations**: Use `.mutationOptions({})` which includes mutationFn
6. **Query options**: Pass `{ input: undefined }` for no-input queries
