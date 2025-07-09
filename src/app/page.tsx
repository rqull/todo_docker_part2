"use client";
import { useState, useEffect } from "react";
import { BorderBeam } from "@/components/magicui/border-beam";
import { RainbowButton } from "@/components/magicui/rainbow-button";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

const Home = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editInput, setEditInput] = useState("");

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos");
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: input }),
      });

      if (response.ok) {
        setInput("");
        fetchTodos();
      }
    } catch (error) {
      console.error("Error adding todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditInput(todo.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditInput("");
  };

  const saveEdit = async (id: number) => {
    if (!editInput.trim()) return;

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editInput }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditInput("");
        fetchTodos();
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus todo ini?")) return;

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTodos();
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <div className="relative max-w-md mx-auto mt-10 p-6 bg-card rounded-lg shadow-lg border border-border">
      <BorderBeam
        size={300}
        colorFrom="#ffaa40"
        colorTo="#9c40ff"
        borderWidth={2}
      />
      <h1 className="text-2xl font-bold mb-4 text-center text-card-foreground">
        Todolist Prisma
      </h1>
      <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
        <input
          className="flex-1 border border-input bg-background text-foreground rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tambah todo baru..."
        />
        <RainbowButton type="submit" disabled={loading}>
          Tambah
        </RainbowButton>
      </form>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between p-2 border border-border rounded bg-muted/30 text-foreground shadow-sm"
          >
            {editingId === todo.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  className="flex-1 border border-input bg-background text-foreground rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editInput}
                  onChange={(e) => setEditInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && saveEdit(todo.id)}
                  placeholder="Edit todo..."
                  aria-label="Edit todo title"
                />
                <RainbowButton size="sm" onClick={() => saveEdit(todo.id)}>
                  Simpan
                </RainbowButton>
                <RainbowButton variant="outline" size="sm" onClick={cancelEdit}>
                  Batal
                </RainbowButton>
              </div>
            ) : (
              <>
                <span
                  className={todo.completed ? "line-through opacity-60" : ""}
                >
                  {todo.title}
                </span>
                <div className="flex gap-1">
                  <RainbowButton
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                  >
                    {todo.completed ? "Selesai" : "Belum"}
                  </RainbowButton>
                  <RainbowButton
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(todo)}
                  >
                    Edit
                  </RainbowButton>
                  <RainbowButton
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    Hapus
                  </RainbowButton>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
