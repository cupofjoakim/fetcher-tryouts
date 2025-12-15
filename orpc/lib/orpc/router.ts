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
