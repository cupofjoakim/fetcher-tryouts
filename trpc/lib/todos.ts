import { randomUUID } from "crypto"

export type Todo = {
  id: string
  text: string
}

const todos: Todo[] = [
  { id: randomUUID(), text: "Learn Next.js" },
  { id: randomUUID(), text: "Build a todo app" },
]

export function getTodos(): Todo[] {
  return todos
}

export function addTodo(text: string): Todo {
  const todo: Todo = { id: randomUUID(), text }
  todos.push(todo)
  return todo
}

export function removeTodo(id: string): void {
  const index = todos.findIndex((todo) => todo.id === id)
  if (index !== -1) {
    todos.splice(index, 1)
  }
}
