import { getTodos } from "@/lib/todos"
import { TodoList } from "@/components/todo-list"

export default function Home() {
  const todos = getTodos()

  return (
    <main>
      <h1>Todo App (tRPC + TanStack Query)</h1>
      <TodoList initialTodos={todos} />
    </main>
  )
}
