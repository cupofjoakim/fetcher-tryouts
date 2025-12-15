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
          disabled={addMutation.isPending}
        />
        <button type="submit" disabled={addMutation.isPending || !text.trim()}>
          Add
        </button>
      </form>
    </div>
  )
}
