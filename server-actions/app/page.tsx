import { getTodos } from "@/lib/todos"
import { addTodoAction, removeTodoAction } from "./actions"

export default function Home() {
  const todos = getTodos()

  return (
    <main>
      <h1>Todo App (Server Actions)</h1>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.text}
            <form action={removeTodoAction} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={todo.id} />
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>

      <form action={addTodoAction}>
        <input
          type="text"
          name="text"
          placeholder="Add a todo..."
          required
        />
        <button type="submit">Add</button>
      </form>
    </main>
  )
}
