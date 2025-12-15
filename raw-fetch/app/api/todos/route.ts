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
