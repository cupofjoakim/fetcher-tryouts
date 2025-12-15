"use client"

import { useState } from "react"
import { trpc } from "@/lib/trpc/client"
import type { Todo } from "@/lib/todos"

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [text, setText] = useState("")

  const { data: todos = [] } = trpc.todo.list.useQuery(undefined, {
    initialData: initialTodos,
  })

  const utils = trpc.useUtils()

  const addMutation = trpc.todo.add.useMutation({
    onSuccess: () => {
      utils.todo.list.invalidate()
      setText("")
    },
  })

  const removeMutation = trpc.todo.remove.useMutation({
    onSuccess: () => {
      utils.todo.list.invalidate()
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
          disabled={addMutation.isPending}
        />
        <button type="submit" disabled={addMutation.isPending || !text.trim()}>
          Add
        </button>
      </form>
    </div>
  )
}
