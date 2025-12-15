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

export async function addTodoAction(formData: FormData): Promise<void> {
  const result = addTodoSchema.safeParse({
    text: formData.get("text"),
  })

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid input")
  }

  addTodo(result.data.text)
  revalidatePath("/")
}

export async function removeTodoAction(formData: FormData): Promise<void> {
  const result = removeTodoSchema.safeParse({
    id: formData.get("id"),
  })

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid input")
  }

  removeTodo(result.data.id)
  revalidatePath("/")
}
