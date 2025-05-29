import { Task } from "../types/Task";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "./EmptyState";
import { forwardRef } from "react";

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskList = forwardRef<HTMLDivElement, TaskListProps>(
  ({ tasks, onEditTask, onDeleteTask }, ref) => {
    if (tasks.length === 0) {
      return <EmptyState />;
    }

    // Sort tasks by priority (P1 highest) and then by due date
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder = { P1: 1, P2: 2, P3: 3, P4: 4 };

      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      // If both are Date objects, compare them
      if (a.dueDate instanceof Date && b.dueDate instanceof Date) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }

      // If one is a Date and the other is a string/null, prioritize the Date
      if (a.dueDate instanceof Date && !(b.dueDate instanceof Date)) return -1;
      if (!(a.dueDate instanceof Date) && b.dueDate instanceof Date) return 1;

      // If both are strings or one/both are null, sort by creation date
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const priorityGroups = {
      P1: sortedTasks.filter((task) => task.priority === "P1"),
      P2: sortedTasks.filter((task) => task.priority === "P2"),
      P3: sortedTasks.filter((task) => task.priority === "P3"),
      P4: sortedTasks.filter((task) => task.priority === "P4"),
    };

    const renderPriorityGroup = (
      priority: "P1" | "P2" | "P3" | "P4",
      tasks: Task[]
    ) => {
      if (tasks.length === 0) return null;

      const priorityLabels = {
        P1: "Urgent",
        P2: "High Priority",
        P3: "Medium Priority",
        P4: "Low Priority",
      };

      const priorityColors = {
        P1: "border-red-200 bg-red-50",
        P2: "border-orange-200 bg-orange-50",
        P3: "border-blue-200 bg-blue-50",
        P4: "border-gray-200 bg-gray-50",
      };

      return (
        <div key={priority} className="mb-8">
          <div
            className={`flex items-center gap-3 mb-4 p-3 rounded-lg border ${priorityColors[priority]}`}
          >
            <div
              className={`w-3 h-3 rounded-full ${
                priority === "P1"
                  ? "bg-red-500"
                  : priority === "P2"
                  ? "bg-orange-500"
                  : priority === "P3"
                  ? "bg-blue-500"
                  : "bg-gray-500"
              }`}
            />
            <h2 className="text-lg font-semibold text-gray-900">
              {priorityLabels[priority]}
            </h2>
            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </div>
      );
    };

    return (
      <div ref={ref} className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <div className="text-sm text-gray-500">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} total
          </div>
        </div>

        {renderPriorityGroup("P1", priorityGroups.P1)}
        {renderPriorityGroup("P2", priorityGroups.P2)}
        {renderPriorityGroup("P3", priorityGroups.P3)}
        {renderPriorityGroup("P4", priorityGroups.P4)}
      </div>
    );
  }
);
