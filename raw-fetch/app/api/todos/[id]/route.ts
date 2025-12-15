import { NextResponse } from "next/server"
import { z } from "zod"
import { removeTodo } from "@/lib/todos"

const deleteSchema = z.object({
  id: z.string().uuid("Invalid todo ID"),
})

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = deleteSchema.safeParse({ id })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  removeTodo(result.data.id)
  return NextResponse.json({ success: true })
}
