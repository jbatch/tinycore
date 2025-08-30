import React, { useState } from "react";
import {
  TinyCoreProvider,
  useAuth,
  useKVList,
  useApplications,
} from "@jbatch/tinycore-client";
import { Plus, Trash2, Check, LogOut, User } from "lucide-react";

// Configuration - point to your TinyCore server
const TINYCORE_CONFIG = {
  baseUrl: "http://localhost:3000", // Change this to your TinyCore server URL
};

const APP_ID = "todo-app";

// Login Component
function LoginForm() {
  const { login, register, loading, error } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: unknown) {
      console.error(err)
      // Error is handled by useAuth hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          TinyCore Todo App
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isLogin ? "Need an account? Register" : "Have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Todo Item Component
function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: {
    key: string;
    value: { text: string; completed: boolean; createdAt: string };
  };
  onToggle: (key: string) => void;
  onDelete: (key: string) => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        todo.value.completed
          ? "bg-gray-50 border-gray-200"
          : "bg-white border-gray-300"
      }`}
    >
      <button
        onClick={() => onToggle(todo.key)}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
          todo.value.completed
            ? "bg-green-500 border-green-500 text-white"
            : "border-gray-300 hover:border-green-500"
        }`}
      >
        {todo.value.completed && <Check size={12} />}
      </button>

      <span
        className={`flex-1 ${
          todo.value.completed ? "line-through text-gray-500" : ""
        }`}
      >
        {todo.value.text}
      </span>

      <button
        onClick={() => onDelete(todo.key)}
        className="flex-shrink-0 text-red-500 hover:text-red-700 p-1"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// App Setup Component - Creates the todo app if it doesn't exist
function AppSetup({ children }: { children: React.ReactNode }) {
  const { applications, create, loading } = useApplications();
  const [isCreating, setIsCreating] = useState(false);

  const todoApp = applications?.find((app) => app.id === APP_ID);

  const createTodoApp = async () => {
    setIsCreating(true);
    try {
      await create({
        id: APP_ID,
        name: "Todo Application",
        metadata: {
          description: "Simple todo list app",
          version: "1.0.0",
        },
      });
    } catch (error) {
      console.error("Failed to create todo app:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading applications...</div>
      </div>
    );
  }

  if (!todoApp) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Setup Required</h2>
          <p className="text-gray-600 mb-6">
            First, we need to create the todo application in TinyCore.
          </p>
          <button
            onClick={createTodoApp}
            disabled={isCreating}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create Todo App"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Main Todo Component
function TodoApp() {
  const { user, logout } = useAuth();
  const {
    data: todos,
    create,
    deleteKey,
    loading,
    error,
  } = useKVList(APP_ID, "todo-");
  const [newTodoText, setNewTodoText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    setIsAdding(true);
    try {
      const todoKey = `todo-${Date.now()}`;
      await create(todoKey, {
        text: newTodoText.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      });
      setNewTodoText("");
    } catch (err) {
      console.error("Failed to add todo:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTodo = async (key: string) => {
    const todo = todos?.find((t) => t.key === key);
    if (!todo) return;

    try {
      await create(key, {
        ...todo.value,
        completed: !todo.value.completed,
      });
    } catch (err) {
      console.error("Failed to toggle todo:", err);
    }
  };

  const deleteTodo = async (key: string) => {
    try {
      await deleteKey(key);
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  };

  const completedTodos = todos?.filter((todo) => todo.value.completed) || [];
  const pendingTodos = todos?.filter((todo) => !todo.value.completed) || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto max-w-2xl py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">My Todos</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={16} />
                <span className="text-sm">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-red-600 hover:text-red-800"
              >
                <LogOut size={16} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add Todo Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={addTodo} className="flex gap-3">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding || !newTodoText.trim()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              {isAdding ? "Adding..." : "Add"}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
            Loading todos...
          </div>
        )}

        {/* Todos List */}
        {!loading && (
          <div className="space-y-6">
            {/* Pending Todos */}
            {pendingTodos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  To Do ({pendingTodos.length})
                </h2>
                <div className="space-y-3">
                  {pendingTodos.map((todo) => (
                    <TodoItem
                      key={todo.key}
                      todo={todo}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Todos */}
            {completedTodos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Completed ({completedTodos.length})
                </h2>
                <div className="space-y-3">
                  {completedTodos.map((todo) => (
                    <TodoItem
                      key={todo.key}
                      todo={todo}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {todos && todos.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-gray-400 mb-2">
                  <Plus size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No todos yet
                </h3>
                <p className="text-gray-500">
                  Add your first todo above to get started!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Component
function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  return (
    <AppSetup>
      <TodoApp />
    </AppSetup>
  );
}

// Root App with Provider
function App() {
  return (
    <TinyCoreProvider config={TINYCORE_CONFIG}>
      <AppContent />
    </TinyCoreProvider>
  );
}

export default App;
