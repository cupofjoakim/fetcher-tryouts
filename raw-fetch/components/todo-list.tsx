"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import type { Todo } from "@/lib/todos"

async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch("/api/todos")
  if (!res.ok) throw new Error("Failed to fetch todos")
  return res.json()
}

async function createTodo(text: string): Promise<Todo> {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error("Failed to create todo")
  return res.json()
}

async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`/api/todos/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete todo")
}

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [text, setText] = useState("")
  const queryClient = useQueryClient()

  const { data: todos = [] } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    initialData: initialTodos,
  })

  const addMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      setText("")
    },
  })

  const removeMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      addMutation.mutate(text.trim())
    }
  }

  return (
    <div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.text}
            <button
              onClick={() => removeMutation.mutate(todo.id)}
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
