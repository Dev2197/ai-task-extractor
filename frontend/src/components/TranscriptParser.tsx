import { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Loader2, FileText } from "lucide-react";
import { Task } from "../types/Task";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface TranscriptParserProps {
  onTasksExtracted: (tasks: Task[]) => void;
}

export const TranscriptParser = ({
  onTasksExtracted,
}: TranscriptParserProps) => {
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/parse-transcript`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to parse transcript");
      }

      // Convert ISO date strings to Date objects for each task, but preserve string dates
      const parsedTasks = result.data.map((task: any) => ({
        ...task,
        id: crypto.randomUUID(),
        dueDate: task.dueDate
          ? /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(task.dueDate)
            ? new Date(task.dueDate)
            : task.dueDate
          : null,
        createdAt: new Date(),
      }));

      onTasksExtracted(parsedTasks);
      setTranscript("");
    } catch (err: any) {
      setError(err.message || "Failed to parse transcript");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            📝 Parse Meeting Transcript
          </h2>
          <p className="text-sm text-gray-500">
            Paste your meeting transcript to extract tasks automatically
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your meeting transcript here..."
          className="min-h-[150px] resize-y"
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !transcript.trim()}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Extracting Tasks...
            </>
          ) : (
            "Extract Tasks"
          )}
        </Button>
      </form>
    </div>
  );
};
