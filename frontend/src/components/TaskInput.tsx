import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParsedTask } from "../types/Task";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
interface TaskInputProps {
  onAddTask: (task: ParsedTask) => void;
}

export const TaskInput = ({ onAddTask }: TaskInputProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/parse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskText: input }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to parse task");
      }

      // Convert the ISO date string to a Date object only if it's a valid ISO date
      const parsedTask = {
        ...result.data,
        dueDate: result.data.dueDate
          ? /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(result.data.dueDate)
            ? new Date(result.data.dueDate)
            : result.data.dueDate
          : null,
      };

      onAddTask(parsedTask);
      setInput("");
    } catch (err) {
      setError(err.message || "Failed to parse task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Add a new task</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe task in natural language... e.g., 'Review presentation by Alice tomorrow at 2pm P1'"
            className="w-full min-h-[100px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 transition-all duration-200"
            disabled={isLoading}
          />

          {input && (
            <div className="absolute bottom-3 right-3">
              <span className="text-xs text-gray-400">
                {input.length} characters
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end">
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Task
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
