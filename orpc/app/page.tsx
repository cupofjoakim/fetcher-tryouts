import { getTodos } from "@/lib/todos"
import { TodoList } from "@/components/todo-list"

export default function Home() {
  const todos = getTodos()

  return (
    <main>
      <h1>oRPC Todo App</h1>
      <TodoList initialTodos={todos} />
    </main>
  )
}
