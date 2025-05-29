import { useState, useRef, useEffect } from "react";
import { TaskInput } from "../components/TaskInput";
import { TaskList } from "../components/TaskList";
import { EditTaskModal } from "../components/EditTaskModal";
import { TranscriptParser } from "../components/TranscriptParser";
import { Task } from "../types/Task";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  // Effect to handle scrolling after tasks are added
  useEffect(() => {
    if (shouldScroll && taskListRef.current) {
      const timer = setTimeout(() => {
        taskListRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        setShouldScroll(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [shouldScroll, tasks]);

  const addTask = (task: Task) => {
    setTasks((prev) => [
      ...prev,
      { ...task, id: crypto.randomUUID(), createdAt: new Date() },
    ]);
    setShouldScroll(true);
  };

  const addTasks = (newTasks: Task[]) => {
    setTasks((prev) => [...prev, ...newTasks]);
    setShouldScroll(true);
  };

  const editTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setEditingTask(null);
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Smart Task Manager AI
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Effortlessly create and manage tasks using natural language. Our AI
            understands context, preserves time references, and automatically
            detects assignees and priorities. Perfect for both quick task
            entries and meeting transcript parsing.
          </p>
        </div>

        {/* Transcript Parser */}
        <TranscriptParser onTasksExtracted={addTasks} />

        {/* Task Input */}
        <TaskInput onAddTask={addTask} />

        {/* Task List */}
        <TaskList
          ref={taskListRef}
          tasks={tasks}
          onEditTask={setEditingTask}
          onDeleteTask={deleteTask}
        />

        {/* Edit Modal */}
        {editingTask && (
          <EditTaskModal
            task={editingTask}
            isOpen={!!editingTask}
            onClose={() => setEditingTask(null)}
            onSave={editTask}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
