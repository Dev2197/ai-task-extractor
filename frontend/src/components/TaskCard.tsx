import { format, isToday, isTomorrow, isPast } from "date-fns";
import { Calendar, User, Edit, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "../types/Task";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P1":
        return "bg-red-100 text-red-800 border-red-200";
      case "P2":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "P3":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "P4":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDueDate = (dueDate: Date | string | null) => {
    if (!dueDate) return null;

    // If dueDate is a string (e.g., "Wednesday" or "Tonight"), return it as is
    if (typeof dueDate === "string") {
      return dueDate;
    }

    const timeStr = format(dueDate, "h:mm a"); // e.g., "11:00 PM"

    if (isToday(dueDate)) {
      return `${timeStr}, Today`;
    }

    if (isTomorrow(dueDate)) {
      return `${timeStr}, Tomorrow`;
    }

    // Check if the year matches current year
    const currentYear = new Date().getFullYear();
    const isCurrentYear = dueDate.getFullYear() === currentYear;

    // Format: "11:00 PM, 20 June" or "11:00 PM, 20 June 2025"
    return `${timeStr}, ${format(
      dueDate,
      isCurrentYear ? "d MMMM" : "d MMMM yyyy"
    )}`;
  };

  const isOverdue =
    task.dueDate &&
    typeof task.dueDate === "object" &&
    isPast(task.dueDate) &&
    !isToday(task.dueDate);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {task.title}
          </h3>

          <div className="space-y-2">
            {task.assignee && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>
                  Assigned to:{" "}
                  <span className="font-medium">{task.assignee}</span>
                </span>
              </div>
            )}

            {task.dueDate && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  isOverdue ? "text-red-600" : "text-gray-600"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  Due:{" "}
                  <span className="font-medium">
                    {formatDueDate(task.dueDate)}
                  </span>
                </span>
                {isOverdue && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    Overdue
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
              task.priority
            )}`}
          >
            {task.priority}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="text-gray-400 hover:text-blue-600 h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="text-gray-400 hover:text-red-600 h-8 w-8 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Created {format(task.createdAt, "d MMMM yyyy")}</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              task.priority === "P1"
                ? "bg-red-400"
                : task.priority === "P2"
                ? "bg-orange-400"
                : task.priority === "P3"
                ? "bg-blue-400"
                : "bg-gray-400"
            }`}
          />
        </div>
      </div>
    </div>
  );
};
