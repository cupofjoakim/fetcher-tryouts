import { z } from "zod"
import { router, publicProcedure } from "../server"
import { getTodos, addTodo, removeTodo } from "@/lib/todos"

export const todoRouter = router({
  list: publicProcedure.query(() => getTodos()),
  add: publicProcedure
    .input(z.object({ text: z.string().min(1).max(200) }))
    .mutation(({ input }) => addTodo(input.text)),
  remove: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ input }) => {
      removeTodo(input.id)
      return { success: true }
    }),
})
